"""Analytics, Settings, Logs, Upload, Backup & RSS endpoints."""
from __future__ import annotations

import json
import os
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from feedgen.feed import FeedGenerator

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models import AdminLog, Category, Post, Setting, Tag, User, Visit
from app.schemas import (
    AdminLogOut,
    AnalyticsOut,
    DailyVisitOut,
    ProfileUpdate,
    SettingOut,
    SettingUpdate,
    TopPostOut,
    VisitCreate,
)
from fastapi.responses import Response

router = APIRouter(prefix="/api", tags=["analytics", "settings"])


# ── Visit tracking ───────────────────────────────

@router.post("/visits")
async def record_visit(body: VisitCreate, request: Request, db: AsyncSession = Depends(get_db)):
    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "0.0.0.0")
    ua = request.headers.get("user-agent", "")[:500]
    referer = request.headers.get("referer", "")[:500]
    visit = Visit(
        post_id=body.post_id,
        page_path=body.page_path[:255],
        ip_address=ip[:45],
        user_agent=ua,
        referer=referer,
    )
    db.add(visit)

    if body.post_id:
        result = await db.execute(select(Post).where(Post.id == body.post_id))
        post = result.scalar_one_or_none()
        if post:
            post.view_count = post.view_count + 1

    return {"ok": True}


# ── Analytics ────────────────────────────────────

@router.get("/analytics", response_model=AnalyticsOut)
async def analytics(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    total_views = (await db.execute(select(func.count(Visit.id)))).scalar() or 0
    total_posts = (await db.execute(select(func.count(Post.id)).where(Post.status == "published"))).scalar() or 0
    total_categories = (await db.execute(select(func.count(Category.id)))).scalar() or 0
    total_tags = (await db.execute(select(func.count(Tag.id)))).scalar() or 0

    # Daily visits (last 30 days)
    since = datetime.now(timezone.utc) - timedelta(days=30)
    daily_stmt = (
        select(func.date(Visit.visited_at).label("d"), func.count(Visit.id).label("c"))
        .where(Visit.visited_at >= since)
        .group_by(text("d"))
        .order_by(text("d"))
    )
    daily_result = await db.execute(daily_stmt)
    daily_visits = [DailyVisitOut(date=str(r.d), count=r.c) for r in daily_result.all()]

    # Top 5 posts by view
    top_stmt = (
        select(Post.id, Post.title, Post.view_count)
        .where(Post.status == "published")
        .order_by(Post.view_count.desc())
        .limit(5)
    )
    top_result = await db.execute(top_stmt)
    top_posts = [TopPostOut(post_id=r.id, title=r.title, views=r.view_count) for r in top_result.all()]

    return AnalyticsOut(
        total_views=total_views,
        total_posts=total_posts,
        total_categories=total_categories,
        total_tags=total_tags,
        daily_visits=daily_visits,
        top_posts=top_posts,
    )


# ── Settings ─────────────────────────────────────

@router.get("/settings", response_model=list[SettingOut])
async def get_settings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Setting))
    return result.scalars().all()


@router.put("/settings")
async def update_settings(items: list[SettingUpdate], user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    for item in items:
        result = await db.execute(select(Setting).where(Setting.key == item.key))
        s = result.scalar_one_or_none()
        if s:
            s.value = item.value
        else:
            db.add(Setting(key=item.key, value=item.value))
    db.add(AdminLog(user_id=user.id, action="update_settings", detail="Updated site settings"))
    return {"ok": True}


# ── Admin profile ────────────────────────────────

@router.put("/profile", response_model=dict)
async def update_profile(body: ProfileUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if body.avatar is not None:
        user.avatar = body.avatar
    if body.bio is not None:
        user.bio = body.bio
    if body.email is not None:
        user.email = body.email
    if body.social_links is not None:
        user.social_links = body.social_links
    db.add(AdminLog(user_id=user.id, action="update_profile", detail="Updated profile"))
    return {"ok": True}


# ── Admin Logs ───────────────────────────────────

@router.get("/admin/logs", response_model=list[AdminLogOut])
async def admin_logs(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = (
        select(AdminLog)
        .options(joinedload(AdminLog.user))
        .order_by(AdminLog.created_at.desc())
        .limit(50)
    )
    result = await db.execute(stmt)
    logs = result.unique().scalars().all()
    out = []
    for log in logs:
        d = AdminLogOut.model_validate(log)
        d.username = log.user.username if log.user else ""
        out.append(d)
    return out


# ── Upload ───────────────────────────────────────

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"}

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="File type not allowed")

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "image.png")[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(content)

    return {"url": f"/uploads/{filename}"}


# ── Backup (JSON export) ────────────────────────

@router.get("/backup")
async def backup(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(Post).where(Post.status != "trashed")
    result = await db.execute(stmt)
    posts = result.scalars().all()

    data = []
    for p in posts:
        data.append({
            "id": p.id,
            "title": p.title,
            "slug": p.slug,
            "excerpt": p.excerpt,
            "content": p.content,
            "status": p.status,
            "published_at": p.published_at.isoformat() if p.published_at else None,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })

    db.add(AdminLog(user_id=user.id, action="backup", detail="Exported all posts as JSON"))
    return Response(
        content=json.dumps(data, ensure_ascii=False, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=blog_backup.json"},
    )


# ── Public RSS feed ──────────────────────────────

@router.get("/rss", response_class=Response)
async def rss_feed(db: AsyncSession = Depends(get_db)):
    # Get site settings
    settings_result = await db.execute(select(Setting))
    site_settings = {s.key: s.value for s in settings_result.scalars().all()}

    fg = FeedGenerator()
    fg.title(site_settings.get("site_title", "Blog"))
    fg.description(site_settings.get("site_subtitle", ""))
    fg.link(href="http://localhost:5173")
    fg.language("en")

    stmt = (
        select(Post)
        .where(Post.status == "published", Post.deleted_at.is_(None))
        .order_by(Post.published_at.desc())
        .limit(20)
    )
    result = await db.execute(stmt)
    for post in result.scalars().all():
        fe = fg.add_entry()
        fe.id(str(post.id))
        fe.title(post.title)
        fe.link(href=f"http://localhost:5173/post/{post.slug}")
        fe.description(post.excerpt or "")
        if post.published_at:
            fe.pubDate(post.published_at.strftime("%a, %d %b %Y %H:%M:%S +0000"))

    rss_xml = fg.rss_str(pretty=True)
    return Response(content=rss_xml, media_type="application/xml")
