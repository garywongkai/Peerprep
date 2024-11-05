// App.tsx
import React, { useState } from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import Landing from "./pages/Landing";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Forgot from "./pages/Forgot";
import QuestionList from "./pages/QuestionList";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Editor from "./pages/Editor";
import Match from "./pages/Matching/Match";
import CollaborationService from "./pages/Collaboration/Collaboration";
import Notification from "./components/Notification";

const App: React.FC = () => {
    const [notification, setNotification] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    const successNotification = (
        message: string,
        type: "success" = "success"
    ) => {
        setNotification({ message, type });
    };

    const errorNotification = (message: string, type: "error" = "error") => {
        setNotification({ message, type });
    };

    const closeNotification = () => {
        setNotification(null);
    };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
                    path="/signin"
                    element={
                        <Signin
                            successNotification={successNotification}
                            errorNotification={errorNotification}
                        />
                    }
                />
                <Route
                    path="/signup"
                    element={
                        <Signup
                            successNotification={successNotification}
                            errorNotification={errorNotification}
                        />
                    }
                />
                <Route
                    path="/reset"
                    element={
                        <Forgot
                            successNotification={successNotification}
                            errorNotification={errorNotification}
                        />
                    }
                />
        <Route path="/question" element={<QuestionList />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route
                    path="/profile"
                    element={
                        <Profile
                            successNotification={successNotification}
                            errorNotification={errorNotification}
                        />
                    }
                />
        <Route path="/editor/:matchId" element={<Editor />} />

        <Route path="/match" element={<Match />} />
        <Route path="/collaboration/:roomId" element={<CollaborationService />} />

      </Routes>
      {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification}
                />
            )}
    </Router>
  );
};

export default App;
