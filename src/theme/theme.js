'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#7367f0',
      light: 'rgba(115, 103, 240, 0.7)',
      dark: '#5e56d6',
      contrastText: '#ffffff',
      danger: '#dc3545',
    },
    secondary: {
      main: '#82868b',
      light: '#a8aaae',
      extraLight: '#e4e4e4ff',
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
      // primary: '#212121',
      primary: '#404040ff',
      secondary: '#757575',
      disabled: '#bdbdbd',
      white: '#ffffff'
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
    secondary: 'linear-gradient(135deg, #dc3545 0%, #ca8080ff 100%)',
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
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 24px',
          boxShadow: 'none',
          outline: 'none',
          transition: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.25s ease, border-color 0.25s ease',
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
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0) scale(0.98)',
          },
          '&:disabled': {
            transform: 'none',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(270deg, rgba(115, 103, 240, 0.8) 0%, #7367f0 100%)',
            boxShadow: '0 4px 16px rgba(115, 103, 240, 0.4)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            background: 'linear-gradient(270deg, rgba(115, 103, 240, 0.9) 0%, #7367f0 100%)',
            transform: 'translateY(0) scale(0.98)',
          },
        },
        outlinedPrimary: {
          borderColor: '#7367f0',
          color: '#7367f0',
          '&:hover': {
            borderColor: '#5e56d6',
            backgroundColor: 'rgba(115, 103, 240, 0.06)',
            transform: 'translateY(-1px)',
          },
        },
        text: {
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          transition: 'box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1), transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          '&:hover': {
            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
            '&:hover:not(.Mui-focused)': {
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 4px rgba(115, 103, 240, 0.08)',
            },
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
          transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        colorPrimary: {
          background: 'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)',
          color: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1), transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        },
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
          transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
          '&:hover': {
            backgroundColor: 'rgba(115, 103, 240, 0.08)',
            transform: 'scale(1.08)',
          },
          '&:active': {
            transform: 'scale(0.94)',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        primary: {
          background: 'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)',
          transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          '&:hover': {
            background: 'linear-gradient(270deg, rgba(115, 103, 240, 0.8) 0%, #5e56d6 100%)',
            transform: 'translateY(-2px) scale(1.05)',
            boxShadow: '0 8px 24px rgba(115, 103, 240, 0.4)',
          },
          '&:active': {
            transform: 'translateY(0) scale(0.96)',
          },
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          '&[aria-hidden="false"]': {
            '& ~ body': {
              paddingRight: '0 !important',
            },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(40, 40, 40, 0.92)',
          fontSize: '0.75rem',
          borderRadius: 6,
          padding: '6px 10px',
          fontWeight: 500,
        },
        arrow: {
          color: 'rgba(40, 40, 40, 0.92)',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          transition: 'opacity 0.3s ease !important',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease !important',
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1) !important',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease, padding-left 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
          '&:hover': {
            paddingLeft: '12px',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease, transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
          '&:hover': {
            transform: 'translateX(2px)',
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
