import { useEffect, useState, useRef } from 'react';
import { Button, Loader, Center } from '@mantine/core';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import BlogCard from '../components/BlogCard';
import { PageTransition, FadeInSection, staggerContainer, staggerItem } from '../components/Motion';
import './Home.less';

// Typing effect hook
function useTypewriter(texts, speed = 60, pause = 2000) {
  const [display, setDisplay] = useState('');
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[index];
    let timeout;

    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex((c) => c + 1), speed);
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex((c) => c - 1), speed / 2);
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setIndex((i) => (i + 1) % texts.length);
    }

    setDisplay(current.slice(0, charIndex));
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, index, texts, speed, pause]);

  return display;
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const subtitle = useTypewriter([
    'Building beautiful things with code.',
    'Exploring design, tech & creativity.',
    'Sharing ideas from my digital garden.',
  ]);

  useEffect(() => {
    api.get('/posts', { params: { page: 1, page_size: 5 } })
      .then((res) => setPosts(res.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Record visit
    api.post('/visits', { page_path: '/' }).catch(() => {});
  }, []);

  return (
    <PageTransition>
      {/* Hero */}
      <section className="home-hero">
        <FadeInSection>
          <p className="home-hero-greeting text-muted">Welcome to my digital garden</p>
        </FadeInSection>
        <FadeInSection delay={0.1}>
          <h1 className="home-hero-title">
            <span className="accent-text">Thoughts</span>, Tutorials
            <br />& Creative Explorations
          </h1>
        </FadeInSection>
        <FadeInSection delay={0.2}>
          <p className="home-hero-subtitle text-muted">
            {subtitle}
            <span className="home-hero-cursor" />
          </p>
        </FadeInSection>
        <FadeInSection delay={0.3}>
          <Button
            size="lg"
            radius="xl"
            variant="gradient"
            gradient={{ from: 'indigo', to: 'violet' }}
            rightSection={<ArrowRight size={18} />}
            onClick={() => navigate('/blog')}
          >
            Explore Articles
          </Button>
        </FadeInSection>
      </section>

      {/* Latest posts - Bento grid */}
      <section className="home-bento">
        <FadeInSection>
          <h2 className="home-bento-title">Latest Posts</h2>
        </FadeInSection>

        {loading ? (
          <Center py="xl"><Loader color="indigo" /></Center>
        ) : (
          <motion.div
            className="home-bento-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {posts.map((post, i) => (
              <motion.div key={post.id} variants={staggerItem}>
                <BlogCard post={post} index={i} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <FadeInSection delay={0.2}>
          <Center mt="xl">
            <Button
              variant="outline"
              color="indigo"
              radius="xl"
              size="md"
              rightSection={<ArrowRight size={16} />}
              onClick={() => navigate('/blog')}
            >
              View All Posts
            </Button>
          </Center>
        </FadeInSection>
      </section>

      {/* About snippet */}
      <section className="home-about-card">
        <FadeInSection>
          <div className="home-about-card-inner glass-card-static">
            <img
              className="home-about-card-avatar"
              src="/avatar.png"
              alt="Author"
              onError={(e) => { e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=garden'; }}
            />
            <div>
              <h3 className="home-about-card-name">Hey, I'm the Author 👋</h3>
              <p className="home-about-card-bio text-muted">
                Full-stack developer & creative thinker. I write about technology,
                design, and the intersection of code and creativity.
                Welcome to my digital garden — a place for growing ideas.
              </p>
              <Button
                variant="subtle"
                color="indigo"
                mt="sm"
                rightSection={<ArrowRight size={14} />}
                onClick={() => navigate('/about')}
              >
                Learn more about me
              </Button>
            </div>
          </div>
        </FadeInSection>
      </section>
    </PageTransition>
  );
}
