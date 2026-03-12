"""Category & Tag endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import Category, Post, Tag, User
from app.schemas import CategoryCreate, CategoryOut, TagCreate, TagOut

router = APIRouter(prefix="/api", tags=["categories", "tags"])


# ── Categories ───────────────────────────────────

@router.get("/categories", response_model=list[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(
            Category,
            func.count(Post.id).label("post_count"),
        )
        .outerjoin(Post, (Post.category_id == Category.id) & (Post.status == "published"))
        .group_by(Category.id)
        .order_by(Category.sort_order)
    )
    result = await db.execute(stmt)
    rows = result.all()
    out = []
    for cat, count in rows:
        d = CategoryOut.model_validate(cat)
        d.post_count = count
        out.append(d)
    return out


@router.post("/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category(body: CategoryCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    cat = Category(**body.model_dump())
    db.add(cat)
    await db.flush()
    return CategoryOut.model_validate(cat)


@router.delete("/categories/{cat_id}")
async def delete_category(cat_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.id == cat_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    await db.delete(cat)
    return {"ok": True}


# ── Tags ─────────────────────────────────────────

@router.get("/tags", response_model=list[TagOut])
async def list_tags(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tag).order_by(Tag.name))
    return result.scalars().all()


@router.post("/tags", response_model=TagOut, status_code=status.HTTP_201_CREATED)
async def create_tag(body: TagCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    tag = Tag(**body.model_dump())
    db.add(tag)
    await db.flush()
    return tag


@router.delete("/tags/{tag_id}")
async def delete_tag(tag_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tag).where(Tag.id == tag_id))
    tag = result.scalar_one_or_none()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    await db.delete(tag)
    return {"ok": True}
