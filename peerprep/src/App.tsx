// App.tsx
import React from 'react';
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
  MemoryRouter,
  Link, Routes, Route,
  BrowserRouter as Router,
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
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
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

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


const App: React.FC = () => {
  return (<Router>
    <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route
            path="/signin"
            element={<Signin />}
        />
    </Routes>
</Router>)
};

  

export default App;
