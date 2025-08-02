import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';

// Airbnb Inspired Navigation Bar Component
function Navbar({ theme, onToggleTheme }) {
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
        <Link className="navbar__action" to="/login">Login</Link>
        <Link className="navbar__action navbar__action--primary" to="/register">Register</Link>
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

// Placeholder pages
function Login() {
  return (
    <div className="page page-card">
      <h1>Login</h1>
      <p>Login form placeholder.</p>
    </div>
  );
}

function Register() {
  return (
    <div className="page page-card">
      <h1>Register</h1>
      <p>Registration form placeholder.</p>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p>Airbnb-style dashboard - upcoming appointments, quick actions, and personalized info will appear here.</p>
    </div>
  );
}

function Profile() {
  return (
    <div className="page page-card">
      <h1>User Profile</h1>
      <p>Profile details &amp; edit form placeholder.</p>
    </div>
  );
}

function Booking() {
  return (
    <div className="page">
      <h1>Book Appointment</h1>
      <p>Booking UI placeholder.</p>
    </div>
  );
}

function SlotManagement() {
  return (
    <div className="page">
      <h1>Slot Management</h1>
      <p>Manage your availability slots here.</p>
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
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
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
                <Login />
              </main>
            </div>
          }
        />
        <Route
          path="/register"
          element={
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
                <Register />
              </main>
            </div>
          }
        />
        <Route
          path="/*"
          element={
            <MainLayout theme={theme} onToggleTheme={toggleTheme}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="booking" element={<Booking />} />
                <Route path="slots" element={<SlotManagement />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
