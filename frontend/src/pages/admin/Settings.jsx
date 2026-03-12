import { useEffect, useState } from 'react';
import {
  Title, Paper, TextInput, Textarea, Button, Group, Loader, Center, Text, SimpleGrid,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Save, Download, User } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { PageTransition, FadeInSection } from '../../components/Motion';

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({});
  const [profile, setProfile] = useState({ avatar: '', bio: '', email: '', social_links: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/settings'), api.get('/auth/me')])
      .then(([settRes, meRes]) => {
        const map = {};
        settRes.data.forEach((s) => { map[s.key] = s.value || ''; });
        setSettings(map);
        setProfile({
          avatar: meRes.data.avatar || '',
          bio: meRes.data.bio || '',
          email: meRes.data.email || '',
          social_links: meRes.data.social_links || {},
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const items = Object.entries(settings).map(([key, value]) => ({ key, value }));
      await api.put('/settings', items);
      notifications.show({ title: 'Saved', message: 'Settings updated', color: 'green' });
    } catch {
      notifications.show({ title: 'Error', color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/profile', profile);
      notifications.show({ title: 'Saved', message: 'Profile updated', color: 'green' });
    } catch {
      notifications.show({ title: 'Error', color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = () => {
    window.open('/api/backup', '_blank');
  };

  if (loading) return <Center py={100}><Loader color="indigo" /></Center>;

  return (
    <PageTransition>
      <Title order={2} fw={800} mb="xl">Settings</Title>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
        {/* Site settings */}
        <FadeInSection>
          <Paper p="lg" radius="lg" withBorder>
            <Text fw={700} size="lg" mb="md">Site Settings</Text>
            <TextInput
              label="Site Title"
              value={settings.site_title || ''}
              onChange={(e) => setSettings({ ...settings, site_title: e.currentTarget.value })}
              mb="md"
              radius="md"
            />
            <TextInput
              label="Site Subtitle"
              value={settings.site_subtitle || ''}
              onChange={(e) => setSettings({ ...settings, site_subtitle: e.currentTarget.value })}
              mb="md"
              radius="md"
            />
            <TextInput
              label="Logo URL"
              value={settings.site_logo || ''}
              onChange={(e) => setSettings({ ...settings, site_logo: e.currentTarget.value })}
              mb="md"
              radius="md"
            />
            <TextInput
              label="Footer Text"
              value={settings.footer_text || ''}
              onChange={(e) => setSettings({ ...settings, footer_text: e.currentTarget.value })}
              mb="lg"
              radius="md"
            />
            <Button
              leftSection={<Save size={16} />}
              onClick={saveSettings}
              loading={saving}
              variant="gradient"
              gradient={{ from: 'indigo', to: 'violet' }}
              radius="md"
            >
              Save Settings
            </Button>
          </Paper>
        </FadeInSection>

        {/* Profile */}
        <FadeInSection delay={0.1}>
          <Paper p="lg" radius="lg" withBorder mb="lg">
            <Text fw={700} size="lg" mb="md">
              <User size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Profile
            </Text>
            <TextInput
              label="Avatar URL"
              value={profile.avatar}
              onChange={(e) => setProfile({ ...profile, avatar: e.currentTarget.value })}
              mb="md"
              radius="md"
            />
            <TextInput
              label="Email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.currentTarget.value })}
              mb="md"
              radius="md"
            />
            <Textarea
              label="Bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.currentTarget.value })}
              mb="md"
              radius="md"
              minRows={3}
            />
            <TextInput
              label="GitHub"
              value={profile.social_links?.github || ''}
              onChange={(e) => setProfile({
                ...profile,
                social_links: { ...profile.social_links, github: e.currentTarget.value },
              })}
              mb="md"
              radius="md"
            />
            <TextInput
              label="Twitter"
              value={profile.social_links?.twitter || ''}
              onChange={(e) => setProfile({
                ...profile,
                social_links: { ...profile.social_links, twitter: e.currentTarget.value },
              })}
              mb="lg"
              radius="md"
            />
            <Button
              leftSection={<Save size={16} />}
              onClick={saveProfile}
              loading={saving}
              variant="light"
              color="indigo"
              radius="md"
            >
              Update Profile
            </Button>
          </Paper>

          {/* Backup */}
          <Paper p="lg" radius="lg" withBorder>
            <Text fw={700} size="lg" mb="md">Backup</Text>
            <Text size="sm" c="dimmed" mb="md">
              Export all posts as a JSON file for backup purposes.
            </Text>
            <Button
              leftSection={<Download size={16} />}
              onClick={handleBackup}
              variant="outline"
              color="indigo"
              radius="md"
            >
              Download JSON Backup
            </Button>
          </Paper>
        </FadeInSection>
      </SimpleGrid>
    </PageTransition>
  );
}
