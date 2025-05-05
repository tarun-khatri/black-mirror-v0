import { createTheme, PaletteMode, ThemeOptions, Theme } from '@mui/material';

// Define base colors for reuse
const neutralPalette = {
  primary: {
    main: '#3f51b5', // Indigo - A common, neutral primary color
    light: '#757de8',
    dark: '#002984',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#f50057', // Pink - A contrasting accent
    light: '#ff5983',
    dark: '#bb002f',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#4caf50', // Standard green
    light: '#81c784',
    dark: '#388e3c',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#f44336', // Standard red
    light: '#e57373',
    dark: '#d32f2f',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#ff9800', // Standard orange
    light: '#ffb74d',
    dark: '#f57c00',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#2196f3', // Standard blue
    light: '#64b5f6',
    dark: '#1976d2',
    contrastText: '#FFFFFF',
  },
};

export const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode
          ...neutralPalette,
          background: {
            default: '#f4f6f8',
            paper: '#FFFFFF',
          },
          text: {
            primary: '#212b36',
            secondary: '#637381',
          },
          divider: 'rgba(0, 0, 0, 0.12)',
        }
      : {
          // Dark mode
          ...neutralPalette,
          background: {
            default: '#161c24',
            paper: '#212b36',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#919eab',
          },
          divider: 'rgba(255, 255, 255, 0.12)',
        }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.875rem' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          boxShadow: `0px 1px 3px rgba(0, 0, 0, ${theme.palette.mode === 'light' ? 0.1 : 0.3})`,
          borderRadius: theme.shape.borderRadius,
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: `0px 4px 12px rgba(0, 0, 0, ${theme.palette.mode === 'light' ? 0.15 : 0.4})`,
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '50px',
          padding: '6px 16px',
          fontWeight: 500,
        },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: neutralPalette.primary.dark,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }: { theme: Theme }) => ({
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper, // Ensure drawer matches background
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
          margin: theme.spacing(0.5, 1),
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
          '&.Mui-selected': {
            backgroundColor: theme.palette.action.selected,
            fontWeight: theme.typography.fontWeightMedium,
          },
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }),
      },
    },
     MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        }
      }
    }
  },
});

export const createAppTheme = (mode: PaletteMode) => {
  return createTheme(getDesignTokens(mode));
};

export default createAppTheme;
