import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/Forgot.css";
import { ThemeProvider } from "@emotion/react";
import Header from "../components/Header";
import theme from "../theme/theme";

function Forgot() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleResetPassword = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const url =
                process.env.REACT_APP_ENV === "development"
                    ? "http://localhost:5001/reset-password"
                    : "https://user-service-327190433280.asia-southeast1.run.app/reset-password";
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                alert("Password reset email sent successfully!");
                navigate("/signin"); // Redirect to the sign-in page after sending the email
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Failed to send reset email");
            }
        } catch (error) {
            console.error("Error during password reset:", error);
            alert("An error occurred while sending the password reset email");
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Header />
            <div className="reset">
                <div className="reset__container">
                    <input
                        type="text"
                        className="reset__textBox"
                        value={email}
                        onChange={(e) => {
                            e.preventDefault();
                            setEmail(e.target.value);
                        }}
                        placeholder="E-mail Address"
                    />
                    <button
                        className="reset__btn"
                        onClick={handleResetPassword}
                    >
                        Send password reset email
                    </button>
                    <div>
                        Don&apos;t have an account?{" "}
                        <Link to="/signup">Register</Link> now.
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
}
export default Forgot;
