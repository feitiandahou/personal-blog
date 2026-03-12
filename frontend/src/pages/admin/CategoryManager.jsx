import { useEffect, useState } from 'react';
import {
  Title, Paper, TextInput, Button, Group, Table, ActionIcon, Tooltip,
  ColorInput, Badge, Loader, Center, Text, SimpleGrid,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../api';
import { PageTransition, FadeInSection } from '../../components/Motion';

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category form
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catColor, setCatColor] = useState('#6366f1');
  const [catDesc, setCatDesc] = useState('');

  // Tag form
  const [tagName, setTagName] = useState('');
  const [tagSlug, setTagSlug] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.get('/categories'), api.get('/tags')])
      .then(([catRes, tagRes]) => {
        setCategories(catRes.data);
        setTags(tagRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  const addCategory = async () => {
    if (!catName || !catSlug) return;
    try {
      await api.post('/categories', { name: catName, slug: catSlug, color: catColor, description: catDesc });
      notifications.show({ title: 'Created', message: `Category "${catName}" added`, color: 'green' });
      setCatName(''); setCatSlug(''); setCatDesc('');
      fetchData();
    } catch (err) {
      notifications.show({ title: 'Error', message: err.response?.data?.detail || 'Failed', color: 'red' });
    }
  };

  const deleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      notifications.show({ title: 'Deleted', color: 'yellow' });
      fetchData();
    } catch {
      notifications.show({ title: 'Error', color: 'red' });
    }
  };

  const addTag = async () => {
    if (!tagName || !tagSlug) return;
    try {
      await api.post('/tags', { name: tagName, slug: tagSlug });
      notifications.show({ title: 'Created', message: `Tag "${tagName}" added`, color: 'green' });
      setTagName(''); setTagSlug('');
      fetchData();
    } catch (err) {
      notifications.show({ title: 'Error', message: err.response?.data?.detail || 'Failed', color: 'red' });
    }
  };

  const deleteTag = async (id) => {
    try {
      await api.delete(`/tags/${id}`);
      notifications.show({ title: 'Deleted', color: 'yellow' });
      fetchData();
    } catch {
      notifications.show({ title: 'Error', color: 'red' });
    }
  };

  if (loading) return <Center py={100}><Loader color="indigo" /></Center>;

  return (
    <PageTransition>
      <Title order={2} fw={800} mb="xl">Categories & Tags</Title>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
        {/* Categories */}
        <div>
          <FadeInSection>
            <Paper p="lg" radius="lg" withBorder mb="lg">
              <Text fw={700} mb="md">Add Category</Text>
              <Group grow mb="sm">
                <TextInput
                  placeholder="Name"
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.currentTarget.value);
                    setCatSlug(e.currentTarget.value.toLowerCase().replace(/\s+/g, '-'));
                  }}
                  radius="md"
                />
                <TextInput placeholder="Slug" value={catSlug} onChange={(e) => setCatSlug(e.currentTarget.value)} radius="md" />
              </Group>
              <Group grow mb="sm">
                <TextInput placeholder="Description" value={catDesc} onChange={(e) => setCatDesc(e.currentTarget.value)} radius="md" />
                <ColorInput value={catColor} onChange={setCatColor} radius="md" />
              </Group>
              <Button leftSection={<Plus size={16} />} onClick={addCategory} variant="light" color="indigo" radius="md">
                Add Category
              </Button>
            </Paper>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <Table highlightOnHover verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Posts</Table.Th>
                  <Table.Th>Color</Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {categories.map((cat) => (
                  <Table.Tr key={cat.id}>
                    <Table.Td><Text fw={500}>{cat.name}</Text></Table.Td>
                    <Table.Td><Badge size="sm" variant="light">{cat.post_count}</Badge></Table.Td>
                    <Table.Td><div style={{ width: 20, height: 20, borderRadius: 6, background: cat.color }} /></Table.Td>
                    <Table.Td>
                      <Tooltip label="Delete">
                        <ActionIcon variant="subtle" color="red" onClick={() => deleteCategory(cat.id)}>
                          <Trash2 size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </FadeInSection>
        </div>

        {/* Tags */}
        <div>
          <FadeInSection delay={0.1}>
            <Paper p="lg" radius="lg" withBorder mb="lg">
              <Text fw={700} mb="md">Add Tag</Text>
              <Group grow mb="sm">
                <TextInput
                  placeholder="Name"
                  value={tagName}
                  onChange={(e) => {
                    setTagName(e.currentTarget.value);
                    setTagSlug(e.currentTarget.value.toLowerCase().replace(/\s+/g, '-'));
                  }}
                  radius="md"
                />
                <TextInput placeholder="Slug" value={tagSlug} onChange={(e) => setTagSlug(e.currentTarget.value)} radius="md" />
              </Group>
              <Button leftSection={<Plus size={16} />} onClick={addTag} variant="light" color="indigo" radius="md">
                Add Tag
              </Button>
            </Paper>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  size="lg"
                  variant="light"
                  color="indigo"
                  rightSection={
                    <ActionIcon variant="transparent" size="xs" onClick={() => deleteTag(tag.id)}>
                      <Trash2 size={12} color="red" />
                    </ActionIcon>
                  }
                >
                  #{tag.name}
                </Badge>
              ))}
            </div>
          </FadeInSection>
        </div>
      </SimpleGrid>
    </PageTransition>
  );
}
