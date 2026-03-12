import { useState, useCallback, useRef, useEffect } from 'react';
import { TextInput, Paper, Text, Loader, Kbd } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [debounced] = useDebouncedValue(query, 300);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (debounced.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    api.get('/posts/search', { params: { q: debounced } })
      .then((res) => setResults(res.data))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debounced]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = useCallback(
    (slug) => {
      setOpen(false);
      setQuery('');
      navigate(`/post/${slug}`);
    },
    [navigate]
  );

  return (
    <div ref={ref} style={{ position: 'relative', width: 260 }}>
      <TextInput
        placeholder="Search posts..."
        leftSection={<SearchIcon size={16} />}
        rightSection={loading ? <Loader size={14} /> : <Kbd size="xs">/</Kbd>}
        value={query}
        onChange={(e) => {
          setQuery(e.currentTarget.value);
          setOpen(true);
        }}
        onFocus={() => query.length >= 2 && setOpen(true)}
        radius="xl"
        size="sm"
        styles={{
          input: {
            backdropFilter: 'blur(10px)',
          },
        }}
      />

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 100 }}
          >
            <Paper shadow="lg" radius="md" p="xs" withBorder>
              {results.map((r) => (
                <div
                  key={r.id}
                  onClick={() => handleSelect(r.slug)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Text size="sm" fw={600} lineClamp={1}>
                    {r.title}
                  </Text>
                  {r.excerpt && (
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {r.excerpt}
                    </Text>
                  )}
                </div>
              ))}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
