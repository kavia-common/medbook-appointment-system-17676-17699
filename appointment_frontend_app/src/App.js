import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './auth';
import { LoginForm, RegistrationForm } from './AuthForms';
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import DoctorListAndBooking from "./DoctorListAndBooking";
import DoctorSlotManagement from "./DoctorSlotManagement";

// Airbnb Inspired Navigation Bar Component
function Navbar({ theme, onToggleTheme }) {
  const { authenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <span className="navbar__brand">MedBook</span>
      </div>
      <ul className="navbar__links">
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/booking">Book</Link>
        </li>
        <li>
          <Link to="/slots">Slots</Link>
        </li>
        <li>
          <Link to="/notifications">Notifications</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
      </ul>
      <div className="navbar__actions">
        {!authenticated ? (
          <>
            <Link className="navbar__action" to="/login">Login</Link>
            <Link className="navbar__action navbar__action--primary" to="/register">Register</Link>
          </>
        ) : (
          <button
            className="navbar__action"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            style={{ color: "#FF5A5F" }}
          >
            Logout{user && user.role ? ` (${user.role})` : ''}
          </button>
        )}
        <button 
          className="theme-toggle theme-toggle-navbar" 
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
}

// Layout for main application pages
function MainLayout({ theme, onToggleTheme, children }) {
  return (
    <div className="app-shell">
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />
      <div className="app-main-content">
        <aside className="sidebar">
          <ul className="sidebar-menu">
            <li>
              <Link to="/dashboard">🏠 Dashboard</Link>
            </li>
            <li>
              <Link to="/booking">📅 Booking</Link>
            </li>
            <li>
              <Link to="/slots">⏳ Slot Management</Link>
            </li>
            <li>
              <Link to="/notifications">🔔 Notifications</Link>
            </li>
            <li>
              <Link to="/profile">👤 Profile</Link>
            </li>
          </ul>
        </aside>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}

// Protected Route Guard: Redirects to /login if not authenticated
function PrivateRoute({ children }) {
  const { authenticated, loading } = useAuth();
  if (loading) return <div className="page"><h2>Loading...</h2></div>;
  return authenticated ? children : <Navigate to="/login" replace />;
}

// Booking page for patients only; doctors see "Not allowed"
function Booking() {
  const { user } = useAuth();
  if (user && user.role === "patient") {
    return <DoctorListAndBooking />;
  }
  if (user && user.role === "doctor") {
    return (
      <div className="page page-card">
        <h2>Doctors cannot book appointments.</h2>
        <p>This page is only available for patients.</p>
      </div>
    );
  }
  return (
    <div className="page page-card">
      <h2>Please login.</h2>
    </div>
  );
}

import DoctorSlotManagement from "./DoctorSlotManagement";
// SlotManagement - route/page for /slots
function SlotManagement() {
  // Only allow slot management page for doctors; show message or redirect otherwise
  const { user } = useAuth();
  if (user && user.role === "doctor") {
    return <DoctorSlotManagement />;
  }
  if (user && user.role !== "doctor") {
    return (
      <div className="page page-card">
        <h2>Access Restricted</h2>
        <p>This page is only available for doctors.</p>
      </div>
    );
  }
  return (
    <div className="page page-card">
      <h2>Please login.</h2>
    </div>
  );
}

function Notifications() {
  return (
    <div className="page">
      <h1>Notifications</h1>
      <p>Notification center placeholder.</p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="page">
      <h1>404 - Not Found</h1>
    </div>
  );
}

// Main Login/Register Page Wrappers
function LoginPage({ theme, toggleTheme }) {
  return (
    <div className="App">
      <main className="single-form-content">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          style={{ position: "fixed", top: 20, right: 20, zIndex: 100 }}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <LoginForm />
      </main>
    </div>
  );
}

function RegisterPage({ theme, toggleTheme }) {
  return (
    <div className="App">
      <main className="single-form-content">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          style={{ position: "fixed", top: 20, right: 20, zIndex: 100 }}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <RegistrationForm />
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<LoginPage theme={theme} toggleTheme={toggleTheme} />}
          />
          <Route
            path="/register"
            element={<RegisterPage theme={theme} toggleTheme={toggleTheme} />}
          />
          <Route
            path="/*"
            element={
              <MainLayout theme={theme} onToggleTheme={toggleTheme}>
                <Routes>
                  <Route path="/" element={<PrivateRoute><Navigate to="/dashboard" replace /></PrivateRoute>} />
                  <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                  <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  <Route path="booking" element={<PrivateRoute><Booking /></PrivateRoute>} />
                  <Route path="slots" element={<PrivateRoute><SlotManagement /></PrivateRoute>} />
                  <Route path="notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MainLayout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
