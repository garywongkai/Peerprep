import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import Stack from '@mui/material/Stack';
import Header from '../components/Header';

const Hero: React.FC = () => {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            component="h1"
            variant="h3"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Welcome to PeerPrep
          </Typography>
          <Typography
            variant="h5"
            align="center"
            color="text.secondary"
            paragraph
          >
            Peerprep is your one-stop solution for all your interview preparation that supports collaboration with peers.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Stack spacing={2} direction="row" justifyContent="center">
              <Button component={RouterLink} to="/signup" variant="contained" color="primary">
                Get Started
              </Button>
            </Stack>
  
          </Box>
        </Container>
      </Box>
    );
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: '#04060a', // Customize your primary color
      },
      secondary: {
        main: '#8992a1', // Customize your secondary color
      },
    },
  });
  
  
  const Features: React.FC = () => {
    const featureList = [
      {
        title: 'Syntax Highlighting',
        description:
          'Our codespace supports intellJ and syntax highlighting.',
        image: 'https://via.placeholder.com/150',
      },
      {
        title: 'Real-time Chat',
        description:
          'Chat in real-time with your peers to discuss on interview questions.',
        image: 'https://via.placeholder.com/150',
      },
      {
        title: 'Online compilation',
        description:
          'Get immediate feedback and debug your code seemlessly.',
        image: 'https://via.placeholder.com/150',
      },
    ];
  
    return (
      <Container sx={{ py: 8 }} maxWidth="md">
        <Grid container spacing={4}>
          {featureList.map((feature, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    // 16:9
                    pt: '56.25%',
                  }}
                  image={feature.image}
                  alt={feature.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {feature.title}
                  </Typography>
                  <Typography>{feature.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  };

  const Landing: React.FC = () => {
    return (
      <ThemeProvider theme={theme}>
        <Header />
        <Hero />
        <Features />
      </ThemeProvider>
    );
  };
  
    
  
  export default Landing;
  
  