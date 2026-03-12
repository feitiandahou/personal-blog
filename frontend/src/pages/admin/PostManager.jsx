import { useEffect, useState } from 'react';
import {
  Title, Table, Badge, Button, Group, ActionIcon, Tooltip, Loader, Center,
  Pagination, Select, Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Plus, Edit, Trash2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { PageTransition, FadeInSection } from '../../components/Motion';

const STATUS_COLORS = {
  published: 'green',
  draft: 'gray',
  scheduled: 'blue',
  trashed: 'red',
};

export default function PostManager() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPosts = () => {
    setLoading(true);
    const params = { page, page_size: 10 };
    if (statusFilter) params.status_filter = statusFilter;

    api.get('/posts/admin/all', { params })
      .then((res) => {
        setPosts(res.data.items);
        setTotal(res.data.total);
        setTotalPages(res.data.total_pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchPosts, [page, statusFilter]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/posts/${id}`);
      notifications.show({ title: 'Moved to trash', color: 'yellow' });
      fetchPosts();
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to delete', color: 'red' });
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.post(`/posts/${id}/restore`);
      notifications.show({ title: 'Restored', color: 'green' });
      fetchPosts();
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to restore', color: 'red' });
    }
  };

  return (
    <PageTransition>
      <FadeInSection>
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={2} fw={800}>Posts</Title>
            <Text size="sm" c="dimmed">{total} total posts</Text>
          </div>
          <Group>
            <Select
              placeholder="Filter by status"
              clearable
              data={[
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'trashed', label: 'Trashed' },
              ]}
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v || ''); setPage(1); }}
              size="sm"
              radius="md"
              w={160}
            />
            <Button
              leftSection={<Plus size={16} />}
              variant="gradient"
              gradient={{ from: 'indigo', to: 'violet' }}
              radius="md"
              onClick={() => navigate('/admin/posts/new')}
            >
              New Post
            </Button>
          </Group>
        </Group>
      </FadeInSection>

      {loading ? (
        <Center py={80}><Loader color="indigo" /></Center>
      ) : (
        <FadeInSection delay={0.1}>
          <Table highlightOnHover verticalSpacing="sm" style={{ borderRadius: 12, overflow: 'hidden' }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Views</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {posts.map((post) => (
                <Table.Tr key={post.id}>
                  <Table.Td>
                    <Text fw={600} lineClamp={1} maw={300}>{post.title}</Text>
                  </Table.Td>
                  <Table.Td>
                    {post.category ? (
                      <Badge size="sm" variant="light" color="indigo">{post.category.name}</Badge>
                    ) : '—'}
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" color={STATUS_COLORS[post.status]}>{post.status}</Badge>
                  </Table.Td>
                  <Table.Td>{post.view_count}</Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : new Date(post.created_at).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <Tooltip label="Edit">
                        <ActionIcon
                          variant="subtle"
                          color="indigo"
                          onClick={() => navigate(`/admin/posts/${post.id}/edit`)}
                        >
                          <Edit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      {post.status === 'trashed' ? (
                        <Tooltip label="Restore">
                          <ActionIcon variant="subtle" color="green" onClick={() => handleRestore(post.id)}>
                            <RotateCcw size={16} />
                          </ActionIcon>
                        </Tooltip>
                      ) : (
                        <Tooltip label="Trash">
                          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(post.id)}>
                            <Trash2 size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {totalPages > 1 && (
            <Center mt="xl">
              <Pagination total={totalPages} value={page} onChange={setPage} color="indigo" radius="xl" />
            </Center>
          )}
        </FadeInSection>
      )}
    </PageTransition>
  );
}
