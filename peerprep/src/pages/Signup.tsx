import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userService } from "../service/UserService";
import "../styles/Signup.css";
import { ThemeProvider } from "@mui/material/styles";
import Header from "../components/Header";
import placeholderImage from '../assets/placeholder.jpg';
import { theme } from "../firebase"; // Keep the theme import if you're still using it

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const register = async () => {
    if (!name || !password || !email) {
      setError("Please fill in all the fields");
      return;
    }
    try {
      await userService.register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error(err);
    }
  };

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
          <button className="register__btn" onClick={register}>
            Register
          </button>
          {error && <p className="error__message">{error}</p>}
          <div>
            Already have an account? <Link to="/signin"><u>Login</u></Link> now.
          </div>
        </div>
        <span className="register__divider"/>
        <div className="register__image">
          <img src={placeholderImage} alt="Placeholder" />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default Signup;