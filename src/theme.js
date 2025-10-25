import { createTheme } from '@mui/material/styles';

// Official U.S. Air Force Academy Brand Colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#003594', // Academy Blue
      dark: '#002554', // Class Royal
      light: '#4169B8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#B2B4B2', // Academy Grey
      dark: '#8E8F8E',
      light: '#D4D5D4',
      contrastText: '#000000',
    },
    error: {
      main: '#A6192E', // Class Red
    },
    warning: {
      main: '#FFC72C', // Class Yellow
    },
    info: {
      main: '#00BED6', // Grotto Blue
    },
    success: {
      main: '#2E7D32',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#4A4A4A',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#003594',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      color: '#002554',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: '#003594',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '1rem',
        },
        contained: {
          boxShadow: '0 4px 6px rgba(0, 53, 148, 0.2)',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0, 53, 148, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#003594',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 53, 148, 0.15)',
        },
      },
    },
  },
});

export default theme;
