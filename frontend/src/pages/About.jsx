import { useEffect, useState } from 'react';
import { Text, Tooltip, ActionIcon, Timeline, Badge } from '@mantine/core';
import { Github, Twitter, Linkedin, Mail, MapPin, Briefcase } from 'lucide-react';
import api from '../api';
import { PageTransition, FadeInSection } from '../components/Motion';

const CAREER_TIMELINE = [
  { year: '2024–Present', title: 'Senior Full-Stack Engineer', desc: 'Building scalable web apps with React & Python' },
  { year: '2022–2024', title: 'Frontend Lead', desc: 'Led UI/UX modernization initiatives' },
  { year: '2020–2022', title: 'Software Engineer', desc: 'Full-stack development with modern frameworks' },
  { year: '2018–2020', title: 'Junior Developer', desc: 'Started the journey into professional coding' },
];

export default function About() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch the admin user profile as "about" data
    api.get('/settings').then((res) => {
      // We'll also try auth/me without token for public about fallback
    }).catch(() => {});
    api.post('/visits', { page_path: '/about' }).catch(() => {});
  }, []);

  return (
    <PageTransition>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* Profile */}
        <FadeInSection>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <img
              src="/avatar.png"
              alt="Author"
              onError={(e) => { e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=garden'; }}
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #6366f1',
                marginBottom: '1.5rem',
              }}
            />
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
              About <span className="accent-text">Me</span>
            </h1>
            <Text size="lg" c="dimmed" maw={500} mx="auto">
              Full-stack developer & creative thinker. Passionate about building
              beautiful, performant web experiences.
            </Text>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: '1.5rem' }}>
              <Tooltip label="GitHub"><ActionIcon variant="light" size="lg" radius="xl" color="gray"><Github size={18} /></ActionIcon></Tooltip>
              <Tooltip label="Twitter"><ActionIcon variant="light" size="lg" radius="xl" color="blue"><Twitter size={18} /></ActionIcon></Tooltip>
              <Tooltip label="LinkedIn"><ActionIcon variant="light" size="lg" radius="xl" color="indigo"><Linkedin size={18} /></ActionIcon></Tooltip>
              <Tooltip label="Email"><ActionIcon variant="light" size="lg" radius="xl" color="red"><Mail size={18} /></ActionIcon></Tooltip>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: '1rem' }}>
              <Badge leftSection={<MapPin size={12} />} variant="light" color="gray" size="lg">
                San Francisco, CA
              </Badge>
              <Badge leftSection={<Briefcase size={12} />} variant="light" color="gray" size="lg">
                Full-Stack Engineer
              </Badge>
            </div>
          </div>
        </FadeInSection>

        {/* Bio */}
        <FadeInSection delay={0.1}>
          <div className="glass-card-static" style={{ padding: '2rem', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
              My Story
            </h2>
            <Text size="md" c="dimmed" style={{ lineHeight: 1.8 }}>
              I've been passionate about technology and design since I wrote my first line of code.
              Over the years, I've worked across the full stack — from crafting pixel-perfect UIs
              to designing scalable backend systems. This blog is my digital garden, where I share
              what I learn, build, and explore. I believe in writing clean code, designing with
              empathy, and always staying curious.
            </Text>
          </div>
        </FadeInSection>

        {/* Career Timeline */}
        <FadeInSection delay={0.2}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Career Journey
          </h2>
          <Timeline active={0} bulletSize={28} lineWidth={2} color="indigo">
            {CAREER_TIMELINE.map((item, i) => (
              <Timeline.Item key={i} title={item.title}>
                <Text size="xs" c="dimmed" mt={4}>{item.year}</Text>
                <Text size="sm" mt={4}>{item.desc}</Text>
              </Timeline.Item>
            ))}
          </Timeline>
        </FadeInSection>
      </div>
    </PageTransition>
  );
}
