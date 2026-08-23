'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#E31E24',
      light: '#FF5252',
      dark: '#C41018',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1A1A2E',
      light: '#2D2D44',
      dark: '#0D0D1A',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8F9FC',
      paper: '#FFFFFF',
    },
    error: { main: '#E53935' },
    warning: { main: '#FB8C00' },
    success: { main: '#43A047' },
    info: { main: '#1E88E5' },
    text: {
      primary: '#1A1A2E',
      secondary: '#64748B',
    },
    divider: 'rgba(0,0,0,0.08)',
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none' as const,
          fontWeight: 600,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 12px rgba(227, 30, 36, 0.3)' },
        },
        contained: {
          background: 'linear-gradient(135deg, #E31E24 0%, #C41018 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #FF5252 0%, #E31E24 100%)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
          border: '1px solid rgba(0,0,0,0.04)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F1F5F9',
            fontWeight: 700,
            color: '#1A1A2E',
            fontSize: '0.8rem',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#E31E24',
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, #E31E24 0%, #C41018 100%)',
            color: '#FFFFFF',
            '&:hover': {
              background: 'linear-gradient(135deg, #FF5252 0%, #E31E24 100%)',
            },
            '& .MuiListItemIcon-root': {
              color: '#FFFFFF',
            },
          },
        },
      },
    },
  },
});
