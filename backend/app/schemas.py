"""Pydantic schemas for request/response validation."""
from __future__ import annotations

import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ── Auth ─────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    role: str
    social_links: Optional[dict] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# ── Category ─────────────────────────────────────
class CategoryCreate(BaseModel):
    name: str = Field(max_length=80)
    slug: str = Field(max_length=80)
    description: Optional[str] = None
    color: str = "#6366f1"
    sort_order: int = 0


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    color: str
    sort_order: int
    post_count: int = 0

    class Config:
        from_attributes = True


# ── Tag ──────────────────────────────────────────
class TagCreate(BaseModel):
    name: str = Field(max_length=50)
    slug: str = Field(max_length=50)


class TagOut(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


# ── Post ─────────────────────────────────────────
class PostCreate(BaseModel):
    title: str = Field(max_length=200)
    slug: str = Field(max_length=200)
    excerpt: Optional[str] = None
    content: str
    cover_image: Optional[str] = None
    category_id: Optional[int] = None
    tag_ids: List[int] = []
    status: str = "draft"
    is_pinned: bool = False
    published_at: Optional[datetime.datetime] = None
    scheduled_at: Optional[datetime.datetime] = None


class PostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None
    category_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None
    status: Optional[str] = None
    is_pinned: Optional[bool] = None
    published_at: Optional[datetime.datetime] = None
    scheduled_at: Optional[datetime.datetime] = None


class PostOut(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: Optional[str]
    content: str
    cover_image: Optional[str]
    author: UserOut
    category: Optional[CategoryOut] = None
    tags: List[TagOut] = []
    status: str
    is_pinned: bool
    view_count: int
    word_count: int
    read_time: int
    published_at: Optional[datetime.datetime]
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


class PostListOut(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: Optional[str]
    cover_image: Optional[str]
    author: UserOut
    category: Optional[CategoryOut] = None
    tags: List[TagOut] = []
    status: str
    is_pinned: bool
    view_count: int
    read_time: int
    published_at: Optional[datetime.datetime]
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class PaginatedPosts(BaseModel):
    items: List[PostListOut]
    total: int
    page: int
    page_size: int
    total_pages: int


# ── Visit / Analytics ────────────────────────────
class VisitCreate(BaseModel):
    post_id: Optional[int] = None
    page_path: str


class DailyVisitOut(BaseModel):
    date: str
    count: int


class TopPostOut(BaseModel):
    post_id: int
    title: str
    views: int


class AnalyticsOut(BaseModel):
    total_views: int
    total_posts: int
    total_categories: int
    total_tags: int
    daily_visits: List[DailyVisitOut]
    top_posts: List[TopPostOut]


# ── Settings ─────────────────────────────────────
class SettingUpdate(BaseModel):
    key: str
    value: str


class SettingOut(BaseModel):
    key: str
    value: Optional[str]

    class Config:
        from_attributes = True


# ── Admin Logs ───────────────────────────────────
class AdminLogOut(BaseModel):
    id: int
    action: str
    detail: Optional[str]
    ip_address: Optional[str]
    created_at: datetime.datetime
    username: str = ""

    class Config:
        from_attributes = True


# ── Profile Update ───────────────────────────────
class ProfileUpdate(BaseModel):
    avatar: Optional[str] = None
    bio: Optional[str] = None
    email: Optional[str] = None
    social_links: Optional[dict] = None


# ── Search ───────────────────────────────────────
class SearchResult(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: Optional[str]
    published_at: Optional[datetime.datetime]

    class Config:
        from_attributes = True
