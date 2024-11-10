import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Signup.css";
import { ThemeProvider } from "react-bootstrap";
import Header from "../components/Header";
import placeholderImage from "../assets/placeholder.jpg";
import theme from "../theme/theme";

interface SignupProps {
    successNotification: (message: string, type?: "success") => void;
    errorNotification: (message: string, type?: "error") => void;
}

const Signup: React.FC<SignupProps> = ({
    successNotification,
    errorNotification,
}) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!name || !email || !password) {
            errorNotification("Please fill in all fields before submitting.");
            return;
        }

        try {
            const url =
                process.env.REACT_APP_ENV === "development"
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
                successNotification(
                    "Registration successful! Please verify your email."
                );
                navigate("/signin"); // Redirect to the sign-in page upon successful registration
            } else {
                const errorData = await response.json();
                console.log(errorData);
                if (
                    errorData.error === "Firebase: Error (auth/invalid-email)."
                ) {
                    errorNotification(
                        "Invalid email format. Please enter a valid email address."
                    );
                } else if (
                    errorData.error ===
                    "Firebase: Error (auth/email-already-in-use)."
                ) {
                    errorNotification(
                        "An account with this email already exists. Please use a different email."
                    );
                } else {
                    errorNotification(errorData.error);
                }
            }
        } catch (error) {
            console.error("Error during registration:", error);
            errorNotification("An error occurred during registration");
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
            <div className="register-page">
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
                        <button
                            className="register__btn"
                            onClick={handleSignup}
                        >
                            Register
                        </button>
                        <div>
                            Already have an account?{" "}
                            <Link to="/signin">
                                <u>Login</u>
                            </Link>{" "}
                            now.
                        </div>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default Signup;
