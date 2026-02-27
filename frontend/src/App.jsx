import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";

// Feature-based imports
import HomePage from "./features/home/pages/HomePage";
import LoginPage from "./features/auth/pages/LoginPage";
import SignUpPage from "./features/auth/pages/SignUpPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import PeoplesPage from "./features/people/pages/PeoplesPage";
import ChatPage from "./features/chat/pages/ChatPage";
import CommunityPage from "./features/community/pages/CommunityPage";
import AdminCommunityPage from "./features/community/pages/AdminCommunityPage";
import ExploreCommunitiesPage from "./features/community/pages/ExploreCommunitiesPage";
import ProfilePage from "./features/profile/pages/ProfilePage";
import NotificationPage from "./features/notifications/pages/NotificationPage";

// P1 Fix: Guard all non-auth routes behind token check
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected routes — redirect to /login if no token */}
          <Route path="/peoples" element={<ProtectedRoute><PeoplesPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
          <Route path="/communities/explore" element={<ProtectedRoute><ExploreCommunitiesPage /></ProtectedRoute>} />
          <Route path="/create-community" element={<ProtectedRoute><AdminCommunityPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;
