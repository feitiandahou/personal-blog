import { useEffect, useState } from 'react';
import { Title, Table, Badge, Text, Loader, Center } from '@mantine/core';
import api from '../../api';
import { PageTransition, FadeInSection } from '../../components/Motion';

const ACTION_COLORS = {
  create_post: 'green',
  update_post: 'blue',
  trash_post: 'red',
  restore_post: 'yellow',
  update_settings: 'violet',
  update_profile: 'cyan',
  backup: 'orange',
};

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/logs')
      .then((res) => setLogs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <FadeInSection>
        <Title order={2} fw={800} mb="xl">Activity Logs</Title>
      </FadeInSection>

      {loading ? (
        <Center py={80}><Loader color="indigo" /></Center>
      ) : (
        <FadeInSection delay={0.1}>
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Action</Table.Th>
                <Table.Th>Detail</Table.Th>
                <Table.Th>IP</Table.Th>
                <Table.Th>Time</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {logs.map((log) => (
                <Table.Tr key={log.id}>
                  <Table.Td>
                    <Text fw={600} size="sm">{log.username}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      size="sm"
                      color={ACTION_COLORS[log.action] || 'gray'}
                      variant="light"
                    >
                      {log.action.replace(/_/g, ' ')}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" lineClamp={1} maw={300}>{log.detail || '—'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">{log.ip_address || '—'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">
                      {new Date(log.created_at).toLocaleString()}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
              {logs.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={5} style={{ textAlign: 'center' }}>
                    <Text c="dimmed" py="lg">No activity logs yet</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </FadeInSection>
      )}
    </PageTransition>
  );
}
