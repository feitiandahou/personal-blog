-- Personal Blog Database Schema for MySQL 8.0+
-- Run: mysql -u root -p123456 < schema.sql

CREATE DATABASE IF NOT EXISTS personal_blog
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE personal_blog;

-- ============================================================
-- Users table
-- ============================================================
CREATE TABLE users (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  email       VARCHAR(120) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  avatar      VARCHAR(500) DEFAULT NULL,
  bio         TEXT         DEFAULT NULL,
  role        ENUM('admin','editor') NOT NULL DEFAULT 'admin',
  social_links JSON        DEFAULT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_username (username)
) ENGINE=InnoDB;

-- ============================================================
-- Categories table
-- ============================================================
CREATE TABLE categories (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(80)  NOT NULL UNIQUE,
  slug        VARCHAR(80)  NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT NULL,
  color       VARCHAR(20)  DEFAULT '#6366f1',
  sort_order  INT          NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_categories_slug (slug)
) ENGINE=InnoDB;

-- ============================================================
-- Tags table
-- ============================================================
CREATE TABLE tags (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50)  NOT NULL UNIQUE,
  slug        VARCHAR(50)  NOT NULL UNIQUE,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tags_slug (slug)
) ENGINE=InnoDB;

-- ============================================================
-- Posts table
-- ============================================================
CREATE TABLE posts (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  slug          VARCHAR(200) NOT NULL UNIQUE,
  excerpt       VARCHAR(500) DEFAULT NULL,
  content       MEDIUMTEXT   NOT NULL,
  cover_image   VARCHAR(500) DEFAULT NULL,
  author_id     BIGINT UNSIGNED NOT NULL,
  category_id   BIGINT UNSIGNED DEFAULT NULL,
  status        ENUM('draft','published','scheduled','trashed') NOT NULL DEFAULT 'draft',
  is_pinned     TINYINT(1)   NOT NULL DEFAULT 0,
  view_count    BIGINT UNSIGNED NOT NULL DEFAULT 0,
  word_count    INT UNSIGNED NOT NULL DEFAULT 0,
  read_time     SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  published_at  DATETIME     DEFAULT NULL,
  scheduled_at  DATETIME     DEFAULT NULL,
  deleted_at    DATETIME     DEFAULT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_posts_author   FOREIGN KEY (author_id)   REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_posts_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_posts_slug       (slug),
  INDEX idx_posts_status     (status),
  INDEX idx_posts_published  (published_at DESC),
  INDEX idx_posts_category   (category_id),
  FULLTEXT INDEX ft_posts_search (title, content)
) ENGINE=InnoDB;

-- ============================================================
-- Post-Tags pivot table
-- ============================================================
CREATE TABLE post_tags (
  post_id BIGINT UNSIGNED NOT NULL,
  tag_id  BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  CONSTRAINT fk_pt_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_pt_tag  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- Visits / Analytics table
-- ============================================================
CREATE TABLE visits (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id    BIGINT UNSIGNED DEFAULT NULL,
  page_path  VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45)  NOT NULL,
  user_agent VARCHAR(500) DEFAULT NULL,
  referer    VARCHAR(500) DEFAULT NULL,
  visited_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_visits_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL,
  INDEX idx_visits_post   (post_id),
  INDEX idx_visits_date   (visited_at),
  INDEX idx_visits_ip     (ip_address)
) ENGINE=InnoDB;

-- ============================================================
-- Site settings (key-value)
-- ============================================================
CREATE TABLE settings (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key`      VARCHAR(100) NOT NULL UNIQUE,
  value      TEXT         DEFAULT NULL,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_settings_key (`key`)
) ENGINE=InnoDB;

-- ============================================================
-- Admin action logs
-- ============================================================
CREATE TABLE admin_logs (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  action     VARCHAR(100) NOT NULL,
  detail     TEXT         DEFAULT NULL,
  ip_address VARCHAR(45)  DEFAULT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_logs_user (user_id),
  INDEX idx_logs_date (created_at DESC)
) ENGINE=InnoDB;

-- ============================================================
-- Seed default admin  (password: admin123  bcrypt hash)
-- ============================================================
INSERT INTO users (username, email, password, avatar, bio, role, social_links) VALUES
('admin', 'admin@blog.com',
 '$2b$12$CCezN775ix6QX6HwYW8Syeq6aOlhAC9.rr8SUYj/Ui4ArLzWiUkXK',
 '/avatar.png',
 'Full-stack developer & creative thinker. Welcome to my digital garden.',
 'admin',
 '{"github":"https://github.com","twitter":"https://twitter.com","linkedin":"https://linkedin.com"}');

-- Default settings
INSERT INTO settings (`key`, value) VALUES
('site_title',    'My Digital Garden'),
('site_subtitle', 'Thoughts, tutorials, and creative explorations'),
('site_logo',     '/logo.svg'),
('footer_text',   '© 2026 My Blog. All rights reserved.');

-- Seed categories
INSERT INTO categories (name, slug, description, color, sort_order) VALUES
('Technology',  'technology',  'Tech tutorials and insights',  '#6366f1', 1),
('Design',      'design',      'UI/UX and visual design',      '#ec4899', 2),
('Lifestyle',   'lifestyle',   'Life stories and reflections',  '#10b981', 3),
('Tutorial',    'tutorial',    'Step-by-step guides',           '#f59e0b', 4);

-- Seed tags
INSERT INTO tags (name, slug) VALUES
('React', 'react'), ('Python', 'python'), ('CSS', 'css'),
('FastAPI', 'fastapi'), ('TypeScript', 'typescript'), ('Design System', 'design-system');
