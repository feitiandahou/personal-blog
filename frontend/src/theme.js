import { createTheme } from '@mantine/core';

const theme = createTheme({
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  headings: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: '700',
  },
  primaryColor: 'indigo',
  colors: {
    indigo: [
      '#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8',
      '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81',
    ],
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
  other: {
    transitionBase: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
});

export default theme;
