// Header.tsx
import React from 'react';
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
  MemoryRouter,
  Link, 
} from 'react-router-dom';
import {StaticRouter} from 'react-router-dom/server';
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
  Switch, 
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import { theme } from '../firebase';

const LinkBehavior = React.forwardRef<any, Omit<RouterLinkProps, 'to'>>(
    (props, ref) => <RouterLink ref={ref} to="/" {...props} role={undefined} />,
  );
  
  function Router(props: { children?: React.ReactNode }) {
    const { children } = props;
    if (typeof window === 'undefined') {
      return <StaticRouter location="/">{children}</StaticRouter>;
    }
  
    return <MemoryRouter>{children}</MemoryRouter>;
  }
  

const Header: React.FC = () => {
    return (
      <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <a href="/" style={{ textDecoration: 'none', color: 'white' }}><img src='https://i.ibb.co/DRGcDJG/logo.png' alt="Peerprep" width="42" height="42"/></a>
            
          </Typography>
            <Stack spacing={2} direction="row" justifyContent="center">
            <Button component={RouterLink} to="/question" variant="contained" color="primary">
                Question List
              </Button>
              <Button component={RouterLink} to="/signup" variant="contained" color="primary">
                Sign up
              </Button>
              <Button component={RouterLink} to="/signin" variant="outlined" color="inherit">
                Sign In
              </Button>
            </Stack>
          
        </Toolbar>
      </AppBar>
      </ThemeProvider>
    );
  };
export default Header;