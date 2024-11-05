import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "react-bootstrap";
import theme from "../theme/theme";
import UserHeader from "../components/UserHeader";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(
    localStorage.getItem("displayName") || ""
  );

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <ThemeProvider theme={theme}>
      <UserHeader />
      <div>
        <h1>Welcome to Peerprep {displayName}!</h1>
      </div>
    </ThemeProvider>
  );
};

export default Dashboard;
