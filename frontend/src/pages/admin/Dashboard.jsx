import { useEffect, useState } from 'react';
import { SimpleGrid, Paper, Text, Loader, Center, Title } from '@mantine/core';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Eye, FileText, FolderOpen, Tags } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api';
import { FadeInSection, staggerContainer, staggerItem } from '../../components/Motion';

const STAT_ICONS = [Eye, FileText, FolderOpen, Tags];
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

function StatCard({ icon: Icon, label, value, color, index }) {
  return (
    <motion.div variants={staggerItem}>
      <Paper
        p="lg"
        radius="lg"
        withBorder
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon size={24} style={{ color }} />
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: '0.05em' }}>
              {label}
            </Text>
            <Text size="xl" fw={800}>{value.toLocaleString()}</Text>
          </div>
        </div>
      </Paper>
    </motion.div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Center py={100}><Loader color="indigo" /></Center>;
  if (!data) return <Text c="dimmed">Failed to load analytics</Text>;

  const stats = [
    { label: 'Total Views', value: data.total_views, color: '#6366f1' },
    { label: 'Published Posts', value: data.total_posts, color: '#8b5cf6' },
    { label: 'Categories', value: data.total_categories, color: '#ec4899' },
    { label: 'Tags', value: data.total_tags, color: '#10b981' },
  ];

  // Pie chart data for source distribution (mock since we have simple visit data)
  const pieData = data.top_posts.map((p, i) => ({
    name: p.title.length > 20 ? p.title.slice(0, 20) + '...' : p.title,
    value: p.views,
  }));

  return (
    <div>
      <FadeInSection>
        <Title order={2} mb="xl" fw={800}>Dashboard</Title>
      </FadeInSection>

      {/* Stats grid */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} mb="xl">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} icon={STAT_ICONS[i]} index={i} />
          ))}
        </SimpleGrid>
      </motion.div>

      {/* Charts */}
      <SimpleGrid cols={{ base: 1, md: 2 }} mb="xl">
        <FadeInSection delay={0.1}>
          <Paper p="lg" radius="lg" withBorder>
            <Text fw={700} mb="md">Daily Views (Last 30 Days)</Text>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.daily_visits}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </FadeInSection>

        <FadeInSection delay={0.2}>
          <Paper p="lg" radius="lg" withBorder>
            <Text fw={700} mb="md">Top 5 Popular Posts</Text>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.top_posts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="title"
                  width={120}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => v.length > 18 ? v.slice(0, 18) + '…' : v}
                />
                <Tooltip />
                <Bar dataKey="views" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </FadeInSection>
      </SimpleGrid>

      {/* Pie chart */}
      {pieData.length > 0 && (
        <FadeInSection delay={0.3}>
          <Paper p="lg" radius="lg" withBorder style={{ maxWidth: 400 }}>
            <Text fw={700} mb="md">Content Distribution</Text>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name }) => name}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </FadeInSection>
      )}
    </div>
  );
}
