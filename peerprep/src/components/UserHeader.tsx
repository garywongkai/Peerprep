// Header.tsx
import React from "react";
import {
  Link as RouterLink,
  useNavigate,
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

const UserHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const url = process.env.NODE_ENV === "development"
      ? "http://localhost:5001/logout"
      : "https://user-service-327190433280.asia-southeast1.run.app/logout";
      const response = await fetch(url, {
        method: "POST",
        credentials: "include", // Ensure cookies are sent
      });

      if (response.ok) {
        // Clear any localStorage, sessionStorage, etc. if you are using them to store tokens
        // localStorage.removeItem("accessToken");

        // Redirect the user after successful logout
        navigate("/signin");
        alert("Logged out successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      alert("An error occurred during logout");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <a
              href="/dashboard"
              style={{ textDecoration: "none", color: "white" }}
            >
              <img
                src="https://i.ibb.co/DRGcDJG/logo.png"
                alt="Peerprep"
                width="42"
                height="42"
              />
            </a>
          </Typography>
          <Stack spacing={2} direction="row" justifyContent="left">
            <Button
              component={RouterLink}
              to="/question"
              variant="contained"
              color="primary"
            >
              Question List
            </Button>
          </Stack>
          <Stack spacing={2} direction="row" justifyContent="left">
            <Button
              component={RouterLink}
              to="/match"
              variant="contained"
              color="primary"
            >
              Match
            </Button>
          </Stack>
          <Stack spacing={2} direction="row" justifyContent="center">
            <Button
              component={RouterLink}
              to="/profile"
              variant="contained"
              color="primary"
            >
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
