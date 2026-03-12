import { useState } from 'react';
import { TextInput, PasswordInput, Button, Paper, Text, Center } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { LogIn, Feather } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      notifications.show({ title: 'Welcome back!', message: 'Logged in successfully', color: 'green' });
      navigate('/admin');
    } catch {
      notifications.show({ title: 'Error', message: 'Invalid credentials', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center mih="100vh" style={{ background: 'var(--mantine-color-body)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <Paper
          shadow="xl"
          radius="xl"
          p="xl"
          w={400}
          withBorder
          style={{ backdropFilter: 'blur(20px)' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Feather size={40} style={{ color: '#6366f1', marginBottom: 12 }} />
            <Text size="xl" fw={800}>Welcome Back</Text>
            <Text size="sm" c="dimmed">Sign in to your admin panel</Text>
          </div>

          <form onSubmit={handleSubmit}>
            <TextInput
              label="Username"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              required
              mb="md"
              radius="md"
              size="md"
            />
            <PasswordInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
              mb="lg"
              radius="md"
              size="md"
            />
            <Button
              type="submit"
              fullWidth
              size="md"
              radius="md"
              loading={loading}
              variant="gradient"
              gradient={{ from: 'indigo', to: 'violet' }}
              leftSection={<LogIn size={18} />}
            >
              Sign In
            </Button>
          </form>
        </Paper>
      </motion.div>
    </Center>
  );
}
