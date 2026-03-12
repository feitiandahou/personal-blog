import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Button, Loader, Center, Text } from '@mantine/core';
import { Calendar, Clock, Eye, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../api';
import { PageTransition, FadeInSection } from '../components/Motion';
import './BlogDetail.less';

function extractHeadings(markdown) {
  const regex = /^(#{2,3})\s+(.+)$/gm;
  const headings = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2],
      id: match[2].toLowerCase().replace(/[^\w]+/g, '-'),
    });
  }
  return headings;
}

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeHeading, setActiveHeading] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/posts/slug/${slug}`)
      .then((res) => setPost(res.data))
      .catch(() => navigate('/blog'))
      .finally(() => setLoading(false));

    // Record visit
    api.get(`/posts/slug/${slug}`).then((res) => {
      api.post('/visits', { post_id: res.data.id, page_path: `/post/${slug}` }).catch(() => {});
    }).catch(() => {});
  }, [slug, navigate]);

  // Track scroll for TOC
  useEffect(() => {
    if (!post) return;
    const headings = extractHeadings(post.content);
    const handler = () => {
      const scrollY = window.scrollY + 100;
      for (let i = headings.length - 1; i >= 0; i--) {
        const el = document.getElementById(headings[i].id);
        if (el && el.offsetTop <= scrollY) {
          setActiveHeading(headings[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [post]);

  const headings = useMemo(() => (post ? extractHeadings(post.content) : []), [post]);

  if (loading) {
    return (
      <PageTransition>
        <Center py={200}><Loader color="indigo" size="lg" /></Center>
      </PageTransition>
    );
  }

  if (!post) return null;

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  return (
    <PageTransition>
      <article className="blog-detail">
        <div className="blog-detail-main">
          <FadeInSection>
            <Button
              variant="subtle"
              color="gray"
              leftSection={<ArrowLeft size={16} />}
              mb="lg"
              onClick={() => navigate('/blog')}
            >
              Back to Blog
            </Button>
          </FadeInSection>

          {post.cover_image && (
            <FadeInSection>
              <img className="blog-detail-cover" src={post.cover_image} alt={post.title} />
            </FadeInSection>
          )}

          <FadeInSection delay={0.1}>
            <div className="blog-detail-meta text-muted">
              {post.category && (
                <Badge variant="light" color="indigo" size="sm">
                  {post.category.name}
                </Badge>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={14} /> {date}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={14} /> {post.read_time} min read
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Eye size={14} /> {post.view_count} views
              </span>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.15}>
            <h1 className="blog-detail-title">{post.title}</h1>
          </FadeInSection>

          {post.tags?.length > 0 && (
            <FadeInSection delay={0.2}>
              <div className="blog-detail-tags">
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" color="indigo" radius="xl" size="sm">
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            </FadeInSection>
          )}

          <FadeInSection delay={0.25}>
            <div className="blog-detail-content markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children }) => {
                    const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
                    return <h2 id={id}>{children}</h2>;
                  },
                  h3: ({ children }) => {
                    const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
                    return <h3 id={id}>{children}</h3>;
                  },
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ borderRadius: 12, fontSize: '0.9rem' }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>{children}</code>
                    );
                  },
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </FadeInSection>

          {/* Copyright notice */}
          <div className="blog-detail-copyright">
            <Text size="sm" fw={500}>
              © {new Date().getFullYear()} My Digital Garden
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              This article is original content. Please credit the source if you share it.
            </Text>
          </div>

          {/* Navigation */}
          <div className="blog-detail-nav">
            <Button
              variant="light"
              leftSection={<ChevronLeft size={16} />}
              onClick={() => navigate('/blog')}
            >
              All Posts
            </Button>
          </div>
        </div>

        {/* Table of Contents */}
        {headings.length > 0 && (
          <aside className="toc">
            <h4 className="toc-title text-muted">On this page</h4>
            <ul className="toc-list">
              {headings.map((h) => (
                <li
                  key={h.id}
                  className={`toc-item text-muted ${activeHeading === h.id ? 'active' : ''}`}
                  data-level={h.level}
                  onClick={() => {
                    const el = document.getElementById(h.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  {h.text}
                </li>
              ))}
            </ul>
          </aside>
        )}
      </article>
    </PageTransition>
  );
}
