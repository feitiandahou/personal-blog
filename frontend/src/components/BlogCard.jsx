import { useNavigate } from 'react-router-dom';
import { Badge } from '@mantine/core';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import { cardHover } from './Motion';
import './BlogCard.less';

export default function BlogCard({ post, index = 0 }) {
  const navigate = useNavigate();

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <motion.div
      className="blog-card"
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      onClick={() => navigate(`/post/${post.slug}`)}
      layout
    >
      {post.cover_image && (
        <div style={{ overflow: 'hidden' }}>
          <img
            className="blog-card-image"
            src={post.cover_image}
            alt={post.title}
            loading="lazy"
          />
        </div>
      )}

      <div className="blog-card-body">
        <div className="blog-card-meta text-muted">
          {post.category && (
            <Badge
              size="xs"
              variant="light"
              color="indigo"
              style={{ textTransform: 'uppercase' }}
            >
              {post.category.name}
            </Badge>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={12} /> {date}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} /> {post.read_time} min read
          </span>
        </div>

        <h3 className="blog-card-title">{post.title}</h3>

        {post.excerpt && (
          <p className="blog-card-excerpt">{post.excerpt}</p>
        )}
      </div>

      <div className="blog-card-footer">
        <div className="blog-card-tags">
          {post.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag.id} size="xs" variant="outline" color="gray">
              {tag.name}
            </Badge>
          ))}
        </div>
        <span className="blog-card-read-more">
          Read more <ArrowRight size={14} />
        </span>
      </div>
    </motion.div>
  );
}
