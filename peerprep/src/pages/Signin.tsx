import * as React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, signInWithGoogle, logInWithEmailAndPassword, theme } from '../firebase';
import '../styles/Signin.css';
import Header from '../components/Header';
import { ThemeProvider } from 'react-bootstrap';
import placeholderImage from '../assets/placeholder.jpg';
const Signin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [user, loading, error] = useAuthState(auth);
  const signin = () => {
    if (!password || !email) alert("Please fill in all the fields");
    else {
      logInWithEmailAndPassword(email, password);
    }
  };
  React.useEffect(() => {
    if (loading) {
      return;
    }
    if (user) {
      navigate("/dashboard");
    } 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);
  return (
    // <ThemeProvider theme={theme}>
    //   <Header/>
    //   <div className="login">
    //   <div className="login__container">
    //     <input
    //       type="text"
    //       className="login__textBox"
    //       value={email}
    //       onChange={(e) => setEmail(e.target.value)}
    //       placeholder="E-mail Address"
    //     />
    //     <input
    //       type="password"
    //       className="login__textBox"
    //       value={password}
    //       onChange={(e) => setPassword(e.target.value)}
    //       placeholder="Password"
    //     />
    //     <button
    //       className="login__btn"
    //       onClick={signin}
    //     >
    //       Login
    //     </button>
    //     <button className="login__btn login__google" onClick={signInWithGoogle}>
    //       Login with Google
    //     </button>
    //     <div>
    //       <Link to="/reset">Forgot Password</Link>
    //     </div>
    //     <div>
    //       Don't have an account? <Link to="/signup">Register</Link> now.
    //     </div>
    //   </div>
    //   </div>
    // </ThemeProvider>
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
          <button className="login__btn" onClick={signin}>
            Login
          </button>
          <button className="login__btn login__google" onClick={signInWithGoogle}>
            Login with Google
          </button>
          <div>
            <Link to="/reset"><u>Forgot Password</u>?</Link>
          </div>
          <div>
            Don't have an account? <Link to="/signup"><u>Register</u></Link> now.
          </div>
        </div>
        <span className="login__divider"></span>
        <div className="login__image">
          <img src={placeholderImage} alt="Placeholder" />
        </div>
      </div>
    </ThemeProvider>
  );
}
export default Signin;