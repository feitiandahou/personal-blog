import { useEffect, useState } from 'react';
import { Badge, Loader, Center, Pagination, Text } from '@mantine/core';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import api from '../api';
import BlogCard from '../components/BlogCard';
import { PageTransition, FadeInSection, staggerContainer, staggerItem } from '../components/Motion';
import './BlogList.less';

export default function BlogList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '1');
  const activeCategory = searchParams.get('category') || '';
  const activeTag = searchParams.get('tag') || '';

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/tags'),
    ]).then(([catRes, tagRes]) => {
      setCategories(catRes.data);
      setTags(tagRes.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, page_size: 9 };
    if (activeCategory) params.category = activeCategory;
    if (activeTag) params.tag = activeTag;

    api.get('/posts', { params })
      .then((res) => {
        setPosts(res.data.items);
        setTotal(res.data.total);
        setTotalPages(res.data.total_pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, activeCategory, activeTag]);

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) {
      p.set(key, val);
    } else {
      p.delete(key);
    }
    p.set('page', '1');
    setSearchParams(p);
  };

  return (
    <PageTransition>
      <div className="blog-list">
        <FadeInSection>
          <div className="blog-list-header">
            <h1 className="blog-list-title">Blog</h1>
            <p className="blog-list-desc text-muted">
              {total} article{total !== 1 ? 's' : ''} and counting
            </p>
          </div>
        </FadeInSection>

        {/* Category filters */}
        <FadeInSection delay={0.1}>
          <div className="blog-list-filters">
            <Badge
              size="lg"
              radius="xl"
              variant={!activeCategory ? 'gradient' : 'outline'}
              gradient={{ from: 'indigo', to: 'violet' }}
              style={{ cursor: 'pointer' }}
              onClick={() => setFilter('category', '')}
            >
              All
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                size="lg"
                radius="xl"
                variant={activeCategory === cat.slug ? 'gradient' : 'outline'}
                gradient={{ from: 'indigo', to: 'violet' }}
                color="gray"
                style={{ cursor: 'pointer' }}
                onClick={() => setFilter('category', activeCategory === cat.slug ? '' : cat.slug)}
              >
                {cat.name} ({cat.post_count})
              </Badge>
            ))}
          </div>
        </FadeInSection>

        {/* Tag filters */}
        {tags.length > 0 && (
          <FadeInSection delay={0.15}>
            <div className="blog-list-filters" style={{ marginTop: -16 }}>
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  size="md"
                  radius="xl"
                  variant={activeTag === tag.slug ? 'filled' : 'light'}
                  color="indigo"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setFilter('tag', activeTag === tag.slug ? '' : tag.slug)}
                >
                  #{tag.name}
                </Badge>
              ))}
            </div>
          </FadeInSection>
        )}

        {/* Posts grid */}
        {loading ? (
          <Center py={80}><Loader color="indigo" /></Center>
        ) : posts.length === 0 ? (
          <div className="blog-list-empty">
            <FileText size={64} className="blog-list-empty-icon" />
            <Text size="lg" fw={600}>No posts found</Text>
            <Text size="sm" c="dimmed" mt="xs">Try a different filter or check back later.</Text>
          </div>
        ) : (
          <motion.div
            className="blog-list-grid"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {posts.map((post, i) => (
              <motion.div key={post.id} variants={staggerItem}>
                <BlogCard post={post} index={i} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="blog-list-pagination">
            <Pagination
              total={totalPages}
              value={page}
              onChange={(p) => {
                const params = new URLSearchParams(searchParams);
                params.set('page', String(p));
                setSearchParams(params);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              color="indigo"
              radius="xl"
            />
          </div>
        )}
      </div>
    </PageTransition>
  );
}
