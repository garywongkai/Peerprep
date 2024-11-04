import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeProvider } from "react-bootstrap";
import placeholderImage from "../assets/placeholder.jpg";
import Header from "../components/Header";
import theme from "../theme/theme";
import "../styles/Signin.css";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const auth = getAuth(); // Initialize Firebase Auth
  const provider = new GoogleAuthProvider(); // Create a Google Auth provider instance

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    const url =
      process.env.REACT_APP_ENV === "development"
        ? "http://localhost:5001/login"
        : "https://user-service-327190433280.asia-southeast1.run.app/login";
    try {
      const response = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.accessToken); // Make sure the key matches the response from your backend
        localStorage.setItem("uid", data.uid);
        localStorage.setItem("email", data.email);
        localStorage.setItem("displayName", data.displayName);
        localStorage.setItem("photoURL", data.photoURL);
        alert("Logged in successfully!");
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred during login");
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const uid = user.uid;
      const email = user.email;

      alert("User logged in successfully with Google");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      alert("An error occurred during Google login");
    }
  };

  useEffect(() => {
    // Check for accessToken in localStorage
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <ThemeProvider theme={theme}>
      <Header />
      <div className="login">
        <div className="login__container">
          <input
            type="text"
            className="login__textBox"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail Address"
          />
          <input
            type="password"
            className="login__textBox"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button className="login__btn" onClick={handleSignIn}>
            Login
          </button>
          <div>
            <Link to="/reset">
              <u>Forgot Password</u>?
            </Link>
          </div>
          <div>
            Don't have an account?{" "}
            <Link to="/signup">
              <u>Register</u>
            </Link>{" "}
            now.
          </div>
        </div>
        <span className="login__divider"></span>
        <div className="login__image">
          <img src={placeholderImage} alt="Placeholder" />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default SignIn;
