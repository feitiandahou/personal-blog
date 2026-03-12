"""SQLAlchemy ORM models."""
from __future__ import annotations

import datetime
from typing import List, Optional

from sqlalchemy import (
    BigInteger,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    SmallInteger,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.mysql import JSON, MEDIUMTEXT
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar: Mapped[Optional[str]] = mapped_column(String(500))
    bio: Mapped[Optional[str]] = mapped_column(Text)
    role: Mapped[str] = mapped_column(Enum("admin", "editor"), default="admin")
    social_links: Mapped[Optional[dict]] = mapped_column(JSON)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    posts: Mapped[List["Post"]] = relationship(back_populates="author")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    color: Mapped[str] = mapped_column(String(20), default="#6366f1")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())

    posts: Mapped[List["Post"]] = relationship(back_populates="category")


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())

    posts: Mapped[List["Post"]] = relationship(secondary="post_tags", back_populates="tags")


class PostTag(Base):
    __tablename__ = "post_tags"

    post_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True)
    tag_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    excerpt: Mapped[Optional[str]] = mapped_column(String(500))
    content: Mapped[str] = mapped_column(MEDIUMTEXT, nullable=False)
    cover_image: Mapped[Optional[str]] = mapped_column(String(500))
    author_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    category_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("categories.id", ondelete="SET NULL"))
    status: Mapped[str] = mapped_column(
        Enum("draft", "published", "scheduled", "trashed"), default="draft"
    )
    is_pinned: Mapped[bool] = mapped_column(default=False)
    view_count: Mapped[int] = mapped_column(BigInteger, default=0)
    word_count: Mapped[int] = mapped_column(Integer, default=0)
    read_time: Mapped[int] = mapped_column(SmallInteger, default=1)
    published_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)
    scheduled_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)
    deleted_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    author: Mapped["User"] = relationship(back_populates="posts")
    category: Mapped[Optional["Category"]] = relationship(back_populates="posts")
    tags: Mapped[List["Tag"]] = relationship(secondary="post_tags", back_populates="posts")


class Visit(Base):
    __tablename__ = "visits"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    post_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("posts.id", ondelete="SET NULL"))
    page_path: Mapped[str] = mapped_column(String(255), nullable=False)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500))
    referer: Mapped[Optional[str]] = mapped_column(String(500))
    visited_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())


class Setting(Base):
    __tablename__ = "settings"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    key: Mapped[str] = mapped_column("key", String(100), unique=True, nullable=False)
    value: Mapped[Optional[str]] = mapped_column(Text)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class AdminLog(Base):
    __tablename__ = "admin_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    detail: Mapped[Optional[str]] = mapped_column(Text)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45))
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship()
