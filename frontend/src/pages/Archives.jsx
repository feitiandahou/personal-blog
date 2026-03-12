import { useEffect, useState } from 'react';
import { Accordion, Badge, Text, Loader, Center } from '@mantine/core';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { PageTransition, FadeInSection } from '../components/Motion';

export default function Archives() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/posts/archives')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    api.post('/visits', { page_path: '/archives' }).catch(() => {});
  }, []);

  const years = Object.keys(data).sort((a, b) => b.localeCompare(a));

  const totalPosts = years.reduce(
    (sum, y) =>
      sum +
      Object.values(data[y]).reduce((ms, posts) => ms + posts.length, 0),
    0
  );

  return (
    <PageTransition>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <FadeInSection>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Archives
          </h1>
          <Text size="lg" c="dimmed" mb="xl">
            {totalPosts} posts across {years.length} year{years.length !== 1 ? 's' : ''}
          </Text>
        </FadeInSection>

        {loading ? (
          <Center py={80}><Loader color="indigo" /></Center>
        ) : (
          <FadeInSection delay={0.1}>
            <Accordion variant="separated" radius="lg" defaultValue={years[0]}>
              {years.map((year) => {
                const months = Object.keys(data[year]);
                const yearCount = months.reduce((s, m) => s + data[year][m].length, 0);

                return (
                  <Accordion.Item key={year} value={year}>
                    <Accordion.Control>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Calendar size={18} style={{ color: '#6366f1' }} />
                        <Text fw={700} size="lg">{year}</Text>
                        <Badge variant="light" color="indigo" size="sm">
                          {yearCount} post{yearCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </Accordion.Control>
                    <Accordion.Panel>
                      {months.map((month) => (
                        <div key={month} style={{ marginBottom: '1.5rem' }}>
                          <Text fw={600} size="sm" c="dimmed" mb="xs" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
                            {month}
                          </Text>
                          {data[year][month].map((post) => (
                            <div
                              key={post.id}
                              onClick={() => navigate(`/post/${post.slug}`)}
                              style={{
                                padding: '8px 12px',
                                borderRadius: 8,
                                cursor: 'pointer',
                                transition: 'background 0.15s',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.06)')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                              <Text size="sm" fw={500}>{post.title}</Text>
                              <Text size="xs" c="dimmed">
                                {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </Text>
                            </div>
                          ))}
                        </div>
                      ))}
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </FadeInSection>
        )}
      </div>
    </PageTransition>
  );
}
