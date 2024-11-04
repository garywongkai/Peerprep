// Header.tsx
import React from "react";
import {
  Link as RouterLink,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  ThemeProvider,
} from "@mui/material";
import Stack from "@mui/material/Stack";
import theme from "../theme/theme";


const Header: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <a href="/" style={{ textDecoration: "none", color: "white" }}>
              <img
                src="https://i.ibb.co/DRGcDJG/logo.png"
                alt="Peerprep"
                width="42"
                height="42"
              />
            </a>
          </Typography>
          <Stack spacing={2} direction="row" justifyContent="center">
            <Button
              component={RouterLink}
              to="/question"
              variant="contained"
              color="primary"
            >
              Question List
            </Button>
            <Button
              component={RouterLink}
              to="/signup"
              variant="contained"
              color="primary"
            >
              Sign up
            </Button>
            <Button
              component={RouterLink}
              to="/signin"
              variant="outlined"
              color="inherit"
            >
              Sign In
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
};
export default Header;
