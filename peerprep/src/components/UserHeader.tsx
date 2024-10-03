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
import { useNavigate } from 'react-router-dom';


const UserHeader: React.FC = () => {
    const handleLogout = async () => {
      try {
        
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/signin');
      } catch (error) {
        console.error('Logout failed', error);
      }
    };
    const navigate = useNavigate();
    return (
      <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <a href="/dashboard" style={{ textDecoration: 'none', color: 'white' }}><img src='https://i.ibb.co/DRGcDJG/logo.png' alt="Peerprep" width="42" height="42"/></a>
            
          </Typography>
            <Stack spacing={2} direction="row" justifyContent="left">
              <Button component={RouterLink} to="/question" variant="contained" color="primary">
                Question List
              </Button>
              </Stack>
            <Stack spacing={2} direction="row" justifyContent="center">
              <Button component={RouterLink} to="/profile" variant="contained" color="primary">
                Profile
              </Button>
              <Button variant="outlined" color="inherit" onClick={handleLogout}>
                Sign out
              </Button>
            </Stack>
          
        </Toolbar>
      </AppBar>
      </ThemeProvider>
    );
  };
export default UserHeader;