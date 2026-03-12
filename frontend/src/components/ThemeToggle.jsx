import { useMantineColorScheme, ActionIcon, Tooltip } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <Tooltip label={dark ? 'Light mode' : 'Dark mode'} position="bottom">
      <ActionIcon
        variant="subtle"
        size="lg"
        radius="xl"
        onClick={toggleColorScheme}
        aria-label="Toggle color scheme"
        color={dark ? 'yellow' : 'indigo'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {dark ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              exit={{ rotate: 90, scale: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Sun size={18} />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              exit={{ rotate: -90, scale: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Moon size={18} />
            </motion.div>
          )}
        </AnimatePresence>
      </ActionIcon>
    </Tooltip>
  );
}
