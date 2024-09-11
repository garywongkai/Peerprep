// App.tsx
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Customize your primary color
    },
    secondary: {
      main: '#ff4081', // Customize your secondary color
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <Hero />
      <Features />
      <Footer />
    </ThemeProvider>
  );
};

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Logo
        </Typography>
        <Button color="inherit">Home</Button>
        <Button color="inherit">Features</Button>
        <Button color="inherit">Contact</Button>
      </Toolbar>
    </AppBar>
  );
};

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
          Welcome to Your Platform
        </Typography>
        <Typography
          variant="h5"
          align="center"
          color="text.secondary"
          paragraph
        >
          This is a simple hero unit, a simple jumbotron-style component for calling
          extra attention to featured content or information.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" color="primary" sx={{ mr: 2 }}>
            Get Started
          </Button>
          <Button variant="outlined" color="primary">
            Learn More
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

const Features: React.FC = () => {
  const featureList = [
    {
      title: 'Feature One',
      description:
        'Description for feature one. This is a placeholder for your content.',
      image: 'https://via.placeholder.com/150',
    },
    {
      title: 'Feature Two',
      description:
        'Description for feature two. This is a placeholder for your content.',
      image: 'https://via.placeholder.com/150',
    },
    {
      title: 'Feature Three',
      description:
        'Description for feature three. This is a placeholder for your content.',
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
              <CardActions>
                <Button size="small">View</Button>
                <Button size="small">Edit</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

const Footer: React.FC = () => {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        p: 6,
      }}
      component="footer"
    >
      <Typography variant="h6" align="center" gutterBottom>
        Footer
      </Typography>
      <Typography
        variant="subtitle1"
        align="center"
        color="text.secondary"
        component="p"
      >
        Placeholder for footer content.
      </Typography>
    </Box>
  );
};

export default App;
