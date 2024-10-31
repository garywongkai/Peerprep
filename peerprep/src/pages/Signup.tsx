import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Signup.css";
import { ThemeProvider } from "react-bootstrap";
import Header from "../components/Header";
import placeholderImage from "../assets/placeholder.jpg";
import theme from "../theme/theme";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getCookie } from "../utils/cookieUtils";

const Signup: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const auth = getAuth(); // Initialize Firebase Auth
  const provider = new GoogleAuthProvider(); // Create a Google Auth provider instance

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const url = process.env.REACT_APP_ENV === "development"
      ? "http://localhost:5001/register"
      : "https://user-service-327190433280.asia-southeast1.run.app/register";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        alert("Registration successful! Please verify your email.");
        navigate("/signin"); // Redirect to the sign-in page upon successful registration
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Registration failed");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred during registration");
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
    const token = getCookie("access_token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <ThemeProvider theme={theme}>
      <Header />
      <div className="register">
        <div className="register__container">
          <input
            type="text"
            className="register__textBox"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
          />
          <input
            type="text"
            className="register__textBox"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail Address"
          />
          <input
            type="password"
            className="register__textBox"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button className="register__btn" onClick={handleSignup}>
            Register
          </button>
          {/* <button
            className="register__btn register__google"
            onClick={signInWithGoogle}
          >
            Register with Google
          </button> */}
          <div>
            Already have an account?{" "}
            <Link to="/signin">
              <u>Login</u>
            </Link>{" "}
            now.
          </div>
        </div>
        <span className="register__divider" />
        <div className="register__image">
          <img src={placeholderImage} alt="Placeholder" />
        </div>
      </div>
    </ThemeProvider>
  );
};
export default Signup;
