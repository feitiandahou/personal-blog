"""Post CRUD endpoints."""
from __future__ import annotations

import math
import re
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from app.auth import get_current_user
from app.database import get_db
from app.models import AdminLog, Category, Post, PostTag, Tag, User
from app.schemas import (
    PaginatedPosts,
    PostCreate,
    PostListOut,
    PostOut,
    PostUpdate,
    SearchResult,
)

router = APIRouter(prefix="/api/posts", tags=["posts"])


def calc_read_time(content: str) -> int:
    words = len(re.findall(r"\w+", content))
    return max(1, math.ceil(words / 200))


def calc_word_count(content: str) -> int:
    return len(re.findall(r"\w+", content))


# ── Public ──────────────────────────────────────

@router.get("", response_model=PaginatedPosts)
async def list_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    category: Optional[str] = None,
    tag: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    q = (
        select(Post)
        .options(joinedload(Post.author), joinedload(Post.category), selectinload(Post.tags))
        .where(Post.status == "published", Post.deleted_at.is_(None))
    )
    count_q = select(func.count(Post.id)).where(Post.status == "published", Post.deleted_at.is_(None))

    if category:
        q = q.join(Category).where(Category.slug == category)
        count_q = count_q.join(Category).where(Category.slug == category)
    if tag:
        q = q.join(Post.tags).where(Tag.slug == tag)
        count_q = count_q.join(Post.tags).where(Tag.slug == tag)

    total = (await db.execute(count_q)).scalar() or 0
    total_pages = max(1, math.ceil(total / page_size))

    q = q.order_by(Post.is_pinned.desc(), Post.published_at.desc())
    q = q.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    posts = result.unique().scalars().all()

    return PaginatedPosts(items=posts, total=total, page=page, page_size=page_size, total_pages=total_pages)


@router.get("/search", response_model=list[SearchResult])
async def search_posts(q: str = Query(..., min_length=1), db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Post)
        .where(
            Post.status == "published",
            Post.deleted_at.is_(None),
            or_(Post.title.ilike(f"%{q}%"), Post.excerpt.ilike(f"%{q}%")),
        )
        .order_by(Post.published_at.desc())
        .limit(10)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/slug/{slug}", response_model=PostOut)
async def get_post_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Post)
        .options(joinedload(Post.author), joinedload(Post.category), selectinload(Post.tags))
        .where(Post.slug == slug, Post.status == "published", Post.deleted_at.is_(None))
    )
    result = await db.execute(stmt)
    post = result.unique().scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.get("/archives")
async def archives(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Post.id, Post.title, Post.slug, Post.published_at)
        .where(Post.status == "published", Post.deleted_at.is_(None))
        .order_by(Post.published_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()
    grouped: dict = {}
    for r in rows:
        if r.published_at is None:
            continue
        year = str(r.published_at.year)
        month = r.published_at.strftime("%B")
        grouped.setdefault(year, {}).setdefault(month, []).append(
            {"id": r.id, "title": r.title, "slug": r.slug, "date": r.published_at.isoformat()}
        )
    return grouped


# ── Admin CRUD ───────────────────────────────────

@router.get("/admin/all", response_model=PaginatedPosts)
async def admin_list_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    status_filter: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Post).options(joinedload(Post.author), joinedload(Post.category), selectinload(Post.tags))
    count_q = select(func.count(Post.id))

    if status_filter:
        q = q.where(Post.status == status_filter)
        count_q = count_q.where(Post.status == status_filter)
    else:
        q = q.where(Post.status != "trashed")
        count_q = count_q.where(Post.status != "trashed")

    total = (await db.execute(count_q)).scalar() or 0
    total_pages = max(1, math.ceil(total / page_size))

    q = q.order_by(Post.updated_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    posts = result.unique().scalars().all()

    return PaginatedPosts(items=posts, total=total, page=page, page_size=page_size, total_pages=total_pages)


@router.get("/admin/{post_id}", response_model=PostOut)
async def admin_get_post(
    post_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Post)
        .options(joinedload(Post.author), joinedload(Post.category), selectinload(Post.tags))
        .where(Post.id == post_id)
    )
    result = await db.execute(stmt)
    post = result.unique().scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("", response_model=PostOut, status_code=status.HTTP_201_CREATED)
async def create_post(
    body: PostCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = Post(
        title=body.title,
        slug=body.slug,
        excerpt=body.excerpt,
        content=body.content,
        cover_image=body.cover_image,
        author_id=user.id,
        category_id=body.category_id,
        status=body.status,
        is_pinned=body.is_pinned,
        word_count=calc_word_count(body.content),
        read_time=calc_read_time(body.content),
        published_at=body.published_at if body.status == "published" else None,
        scheduled_at=body.scheduled_at,
    )
    if body.status == "published" and not body.published_at:
        post.published_at = datetime.now(timezone.utc)
    db.add(post)
    await db.flush()

    if body.tag_ids:
        for tid in body.tag_ids:
            db.add(PostTag(post_id=post.id, tag_id=tid))
        await db.flush()

    # Log
    db.add(AdminLog(user_id=user.id, action="create_post", detail=f"Created post: {body.title}"))

    # Reload with relations
    stmt = (
        select(Post)
        .options(joinedload(Post.author), joinedload(Post.category), selectinload(Post.tags))
        .where(Post.id == post.id)
    )
    result = await db.execute(stmt)
    return result.unique().scalar_one()


@router.put("/{post_id}", response_model=PostOut)
async def update_post(
    post_id: int,
    body: PostUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    update_data = body.model_dump(exclude_unset=True)

    if "content" in update_data:
        update_data["word_count"] = calc_word_count(update_data["content"])
        update_data["read_time"] = calc_read_time(update_data["content"])

    if update_data.get("status") == "published" and not post.published_at:
        update_data["published_at"] = datetime.now(timezone.utc)

    tag_ids = update_data.pop("tag_ids", None)

    for k, v in update_data.items():
        setattr(post, k, v)

    if tag_ids is not None:
        await db.execute(
            PostTag.__table__.delete().where(PostTag.post_id == post_id)
        )
        for tid in tag_ids:
            db.add(PostTag(post_id=post_id, tag_id=tid))

    await db.flush()
    db.add(AdminLog(user_id=user.id, action="update_post", detail=f"Updated post #{post_id}"))

    stmt = (
        select(Post)
        .options(joinedload(Post.author), joinedload(Post.category), selectinload(Post.tags))
        .where(Post.id == post_id)
    )
    result = await db.execute(stmt)
    return result.unique().scalar_one()


@router.delete("/{post_id}")
async def soft_delete_post(
    post_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.status = "trashed"
    post.deleted_at = datetime.now(timezone.utc)
    db.add(AdminLog(user_id=user.id, action="trash_post", detail=f"Trashed post #{post_id}"))
    return {"ok": True}


@router.post("/{post_id}/restore")
async def restore_post(
    post_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.status = "draft"
    post.deleted_at = None
    db.add(AdminLog(user_id=user.id, action="restore_post", detail=f"Restored post #{post_id}"))
    return {"ok": True}
