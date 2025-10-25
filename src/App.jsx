import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme';
import Header from './components/Header';
import MELWorkflow from './components/MELWorkflow';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Header />
        <MELWorkflow />
      </Box>
    </ThemeProvider>
  );
}

export default App;
