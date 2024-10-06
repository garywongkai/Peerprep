import React, { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
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
} from "@mui/material";
import Stack from "@mui/material/Stack";
import Header from "../components/Header";
import UserHeader from "../components/UserHeader";
import "../styles/Landing.css";
import backgroundImage from "../assets/banner.jpg";
import { getCookie } from "../utils/cookieUtils";

const theme = createTheme({
  palette: {
    primary: {
      main: "#04060a", // Customize your primary color
    },
    secondary: {
      main: "#8992a1", // Customize your secondary color
    },
  },
});

const Hero: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
  return (
    <Box
      sx={{
        bgcolor: "background.contrastText",
        backgroundImage: `url(${backgroundImage})`,
        pt: 8,
        pb: 6,
        height: "30vh",
        borderRadius: "0 0 50% 50%",
        border: "1px solid white",
      }}
    >
      <Container maxWidth="sm" className="container">
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
          Peerprep helps you with your interview preparation by collaboration
          with other like-minded individuals!
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Stack spacing={2} direction="row" justifyContent="center">
            {!isLoggedIn && (
              <>
                <Button
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                  color="primary"
                >
                  Get Started
                </Button>
                <Button
                  component={RouterLink}
                  to="/signin"
                  variant="contained"
                  color="primary"
                >
                  Log In
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

const Features: React.FC = () => {
  const featureList = [
    {
      title: "Syntax Highlighting",
      description:
        "Our code editor supports syntax highlighting and IntelliJ-like features.",
      image: require("../assets/syntax.png"),
    },
    {
      title: "Real-time Collaboration",
      description:
        "Collaborate with peers in real-time to discuss interview questions.",
      image: require("../assets/collaboration.jpg"),
    },
    {
      title: "Online Compilation",
      description:
        "Compile and run your code instantly, with feedback for debugging.",
      image: require("../assets/compilation.jpg"),
    },
  ];

  return (
    <Box sx={{ bgcolor: "#f7f7f7", py: 10 }}>
      <Container className="mediacontainer">
        <Typography
          variant="h4"
          align="center"
          color="textPrimary"
          gutterBottom
        >
          Feature List
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" paragraph>
          Here are some key features that make PeerPrep your best choice for
          interview preparation.
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {featureList.map((feature, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 20px rgba(0, 0, 50, 0.1)",
                  border: "1px solid black",
                  borderRadius: "12px 12px 0 0",
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    height: 300,
                    objectFit: "cover",
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
    </Box>
  );
};

const Landing: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get access_token from cookies
    const token = getCookie("access_token");
    setIsLoggedIn(!!token);
  }, [navigate]);

  return (
    <ThemeProvider theme={theme}>
      {isLoggedIn ? <UserHeader /> : <Header />}
      <Hero isLoggedIn={isLoggedIn} />
      <Features />
    </ThemeProvider>
  );
};

export default Landing;
