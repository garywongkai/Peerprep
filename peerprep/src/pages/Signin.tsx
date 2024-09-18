import * as React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, signInWithGoogle, logInWithEmailAndPassword, theme } from '../firebaseConfig';
import "./Signin.css";
import Header from '../components/Header';
import { ThemeProvider } from 'react-bootstrap';

function Signin() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();
  React.useEffect(() => {
    if (loading) {
      // maybe trigger a loading screen
      return;
    }
    if (user) navigate("/dashboard");
  }, [user, loading]);
  return (
    <ThemeProvider theme={theme}>
      <Header/>
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
        <button
          className="login__btn"
          onClick={() => logInWithEmailAndPassword(email, password)}
        >
          Login
        </button>
        <button className="login__btn login__google" onClick={signInWithGoogle}>
          Login with Google
        </button>
        <div>
          <Link to="/reset">Forgot Password</Link>
        </div>
        <div>
          Don't have an account? <Link to="/signup">Register</Link> now.
        </div>
      </div>
      </div>
    </ThemeProvider>
  );
}
export default Signin;