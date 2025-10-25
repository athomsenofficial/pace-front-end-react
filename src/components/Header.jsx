import { AppBar, Toolbar, Typography, Box, Container } from '@mui/material';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';

const Header = () => {
  return (
    <AppBar position="static" elevation={2}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <MilitaryTechIcon sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              PACE
            </Typography>
            <Typography
              variant="caption"
              component="div"
              sx={{
                letterSpacing: '0.1em',
                opacity: 0.9,
                fontSize: '0.7rem',
              }}
            >
              Promotion and Career Eligibility Management System
            </Typography>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
