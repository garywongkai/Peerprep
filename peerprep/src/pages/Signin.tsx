import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeProvider } from "react-bootstrap";
import placeholderImage from "../assets/placeholder.jpg";
import Header from "../components/Header";
import theme from "../theme/theme";
import "../styles/Signin.css";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getCookie } from "../utils/cookieUtils";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const auth = getAuth(); // Initialize Firebase Auth
  const provider = new GoogleAuthProvider(); // Create a Google Auth provider instance

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    const url = process.env.REACT_APP_ENV === "development"
      ? "http://localhost:5001/login"
      : "https://user-service-327190433280.asia-southeast1.run.app/login";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // VERY IMPORTANT TO INCLUDE THE CREDENTIALS
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
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
    // Check for access_token in cookies
    console.log(getCookie);
    const token = getCookie("access_token");
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
          {/* <button
            className="login__btn login__google"
            onClick={signInWithGoogle}
          >
            Login with Google
          </button> */}
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
