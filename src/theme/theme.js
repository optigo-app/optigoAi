'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#7367f0',
      light: 'rgba(115, 103, 240, 0.7)',
      dark: '#5e56d6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#82868b',
      light: '#a8aaae',
      dark: '#6e7278',
      contrastText: '#ffffff',
    },
    success: {
      main: '#28a745',
      light: '#d4edda',
      dark: '#155724',
    },
    warning: {
      main: '#ffc107',
      light: '#fff3cd',
      dark: '#856404',
    },
    error: {
      main: '#dc3545',
      light: '#f8d7da',
      dark: '#721c24',
    },
    info: {
      main: '#17a2b8',
      light: '#d1ecf1',
      dark: '#0c5460',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
      light: '#f5f5f5',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#bdbdbd',
    },
    divider: '#e0e0e0',
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  gradients: {
    primary: 'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)',
    text: 'linear-gradient(135deg, #7367f0 0%, #9c27b0 100%)',
  },
  typography: {
    fontFamily: 'var(--font-poppins), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    h1: {
      fontFamily: 'var(--font-poppins), sans-serif',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: 'var(--font-poppins), sans-serif',
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: 'var(--font-poppins), sans-serif',
      fontWeight: 600,
      lineHeight: 1.25,
    },
    h4: {
      fontFamily: 'var(--font-poppins), sans-serif',
      fontWeight: 600,
      lineHeight: 1.25,
    },
    h5: {
      fontFamily: 'var(--font-poppins), sans-serif',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontFamily: 'var(--font-poppins), sans-serif',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontFamily: 'var(--font-poppins), sans-serif',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontFamily: 'var(--font-poppins), sans-serif',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      fontFamily: 'var(--font-poppins), sans-serif',
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    caption: {
      fontFamily: 'var(--font-poppins), sans-serif',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    overline: {
      fontFamily: 'var(--font-poppins), sans-serif',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 24px',
          boxShadow: 'none',
          outline: 'none',
          '&:focus': {
            outline: 'none',
            boxShadow: 'none',
          },
          '&:focus-visible': {
            outline: 'none',
            boxShadow: '0 0 0 2px rgba(115, 103, 240, 0.3)',
          },
          '&:hover': {
            boxShadow: '0 2px 8px rgba(115, 103, 240, 0.3)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(270deg, rgba(115, 103, 240, 0.8) 0%, #7367f0 100%)',
            boxShadow: '0 4px 12px rgba(115, 103, 240, 0.4)',
          },
          '&:active': {
            background: 'linear-gradient(270deg, rgba(115, 103, 240, 0.9) 0%, #7367f0 100%)',
          },
        },
        outlinedPrimary: {
          borderColor: '#7367f0',
          color: '#7367f0',
          '&:hover': {
            borderColor: '#5e56d6',
            backgroundColor: 'rgba(115, 103, 240, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#7367f0',
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#7367f0',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        colorPrimary: {
          background: 'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)',
          color: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        },
        elevation2: {
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        },
        elevation3: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(115, 103, 240, 0.08)',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        primary: {
          background: 'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)',
          '&:hover': {
            background: 'linear-gradient(270deg, rgba(115, 103, 240, 0.8) 0%, #5e56d6 100%)',
          },
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          // Prevent scrollbar compensation
          '&[aria-hidden="false"]': {
            '& ~ body': {
              paddingRight: '0 !important',
            },
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default theme;
