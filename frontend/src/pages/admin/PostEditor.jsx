import { useEffect, useState } from 'react';
import {
  Title, TextInput, Textarea, Select, MultiSelect, Button, Group, Paper,
  Switch, SimpleGrid, Text, Loader, Center,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Eye } from 'lucide-react';
import api from '../../api';
import { PageTransition, FadeInSection } from '../../components/Motion';

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '', cover_image: '',
    category_id: null, tag_ids: [], status: 'draft', is_pinned: false,
  });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/tags')]).then(([catRes, tagRes]) => {
      setCategories(catRes.data.map((c) => ({ value: String(c.id), label: c.name })));
      setTags(tagRes.data.map((t) => ({ value: String(t.id), label: t.name })));
    });

    if (isEdit) {
      setLoading(true);
      api.get(`/posts/admin/${id}`)
        .then((res) => {
          const post = res.data;
          setForm({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || '',
            content: post.content || '',
            cover_image: post.cover_image || '',
            category_id: post.category ? String(post.category.id) : null,
            tag_ids: (post.tags || []).map((tag) => String(tag.id)),
            status: post.status,
            is_pinned: post.is_pinned,
          });
        })
        .catch(() => notifications.show({ title: 'Error', message: 'Could not load post', color: 'red' }))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Auto-generate slug from title
    if (field === 'title') {
      const slug = value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
      setForm((prev) => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      notifications.show({ title: 'Validation', message: 'Title and content are required', color: 'yellow' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        tag_ids: form.tag_ids.map(Number),
      };

      if (isEdit) {
        await api.put(`/posts/${id}`, payload);
        notifications.show({ title: 'Updated!', message: 'Post saved successfully', color: 'green' });
      } else {
        await api.post('/posts', payload);
        notifications.show({ title: 'Created!', message: 'Post created successfully', color: 'green' });
      }
      navigate('/admin/posts');
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.detail || 'Failed to save post',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Center py={100}><Loader color="indigo" /></Center>;

  return (
    <PageTransition>
      <FadeInSection>
        <Group justify="space-between" mb="xl">
          <Title order={2} fw={800}>{isEdit ? 'Edit Post' : 'New Post'}</Title>
          <Group>
            <Button
              variant="outline"
              color="gray"
              leftSection={<Eye size={16} />}
              onClick={() => form.slug && window.open(`/post/${form.slug}`, '_blank')}
              disabled={!form.slug}
            >
              Preview
            </Button>
            <Button
              variant="gradient"
              gradient={{ from: 'indigo', to: 'violet' }}
              leftSection={<Save size={16} />}
              loading={saving}
              onClick={handleSubmit}
            >
              {isEdit ? 'Update' : 'Publish'}
            </Button>
          </Group>
        </Group>
      </FadeInSection>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        {/* Main content area */}
        <div style={{ gridColumn: 'span 2' }}>
          <FadeInSection delay={0.1}>
            <Paper p="lg" radius="lg" withBorder mb="lg">
              <TextInput
                label="Title"
                placeholder="An amazing blog post title..."
                value={form.title}
                onChange={(e) => handleChange('title', e.currentTarget.value)}
                mb="md"
                size="md"
                radius="md"
                styles={{ input: { fontWeight: 600, fontSize: '1.1rem' } }}
              />
              <TextInput
                label="Slug"
                placeholder="an-amazing-blog-post"
                value={form.slug}
                onChange={(e) => handleChange('slug', e.currentTarget.value)}
                mb="md"
                radius="md"
              />
              <Textarea
                label="Excerpt"
                placeholder="A brief summary of the post..."
                value={form.excerpt}
                onChange={(e) => handleChange('excerpt', e.currentTarget.value)}
                mb="md"
                radius="md"
                minRows={2}
              />
              <TextInput
                label="Cover Image URL"
                placeholder="https://..."
                value={form.cover_image}
                onChange={(e) => handleChange('cover_image', e.currentTarget.value)}
                radius="md"
              />
            </Paper>
          </FadeInSection>

          {/* Markdown Editor (Split screen) */}
          <FadeInSection delay={0.15}>
            <Paper p="lg" radius="lg" withBorder>
              <Text fw={600} mb="sm">Content (Markdown)</Text>
              <SimpleGrid cols={2} spacing="md">
                <Textarea
                  placeholder="Write your post in Markdown..."
                  value={form.content}
                  onChange={(e) => handleChange('content', e.currentTarget.value)}
                  minRows={20}
                  autosize
                  radius="md"
                  styles={{
                    input: {
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      fontSize: '0.875rem',
                      lineHeight: 1.7,
                    },
                  }}
                />
                <Paper
                  p="md"
                  radius="md"
                  withBorder
                  style={{
                    minHeight: 400,
                    maxHeight: 600,
                    overflow: 'auto',
                  }}
                >
                  <Text size="xs" c="dimmed" mb="sm" fw={600} tt="uppercase">Preview</Text>
                  <div
                    className="markdown-body"
                    style={{ fontSize: '0.9rem' }}
                    dangerouslySetInnerHTML={{
                      __html: form.content
                        ? simpleMarkdown(form.content)
                        : '<p style="color:gray">Start typing to see preview...</p>',
                    }}
                  />
                </Paper>
              </SimpleGrid>
            </Paper>
          </FadeInSection>
        </div>

        {/* Sidebar */}
        <div>
          <FadeInSection delay={0.2}>
            <Paper p="lg" radius="lg" withBorder mb="lg">
              <Text fw={600} mb="md">Settings</Text>

              <Select
                label="Status"
                data={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'published', label: 'Published' },
                  { value: 'scheduled', label: 'Scheduled' },
                ]}
                value={form.status}
                onChange={(v) => handleChange('status', v)}
                mb="md"
                radius="md"
              />

              <Select
                label="Category"
                data={categories}
                value={form.category_id}
                onChange={(v) => handleChange('category_id', v)}
                clearable
                mb="md"
                radius="md"
              />

              <MultiSelect
                label="Tags"
                data={tags}
                value={form.tag_ids}
                onChange={(v) => handleChange('tag_ids', v)}
                mb="md"
                radius="md"
                searchable
              />

              <Switch
                label="Pin this post"
                checked={form.is_pinned}
                onChange={(e) => handleChange('is_pinned', e.currentTarget.checked)}
                color="indigo"
              />
            </Paper>
          </FadeInSection>
        </div>
      </SimpleGrid>
    </PageTransition>
  );
}

// Simple markdown to HTML for live preview
function simpleMarkdown(md) {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br />');
  return `<p>${html}</p>`;
}
