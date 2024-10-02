// App.tsx
import React from 'react';
import {
  Routes, Route,
  BrowserRouter as Router,
  Navigate,
} from 'react-router-dom';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Dashboard from './pages/Dashboard';
import Forgot from './pages/Forgot';
import QuestionList from './pages/QuestionList';
import Profile from './pages/Profile';
import Editor from './pages/Editor';
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/signin" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (<Router>
    <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route
            path="/signin"
            element={<Signin />}
        />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/question" element={<QuestionList />} />
        <Route path="/reset" element={<Forgot />} />
        <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
        <Route path="/editor/:matchId" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
    </Routes>
</Router>)
};

export default App;
