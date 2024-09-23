// App.tsx
import React from 'react';
import {
  Routes, Route,
  BrowserRouter as Router,
} from 'react-router-dom';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Dashboard from './pages/Dashboard';
import Forgot from './pages/Forgot';
import QuestionList from './pages/QuestionList';
import Header from './components/Header';
import Profile from './pages/Profile';
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const App: React.FC = () => {
  return (<Router>
    <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route
            path="/signin"
            element={<Signin />}
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/question" element={<QuestionList />} />
        <Route path="/reset" element={<Forgot />} />
        <Route path="/profile" element={<Profile/>} />
    </Routes>
</Router>)
};

export default App;
