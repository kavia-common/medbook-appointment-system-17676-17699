import React, { createContext, useContext, useEffect, useState } from "react";

// Keys for localStorage/sessionStorage
const TOKEN_KEY = "jwt_token";
const USER_ROLE_KEY = "user_role"; // 'patient' or 'doctor' or null

// PUBLIC_INTERFACE
export function setAuthToken(token) {
  /** Sets JWT token in localStorage. */
  localStorage.setItem(TOKEN_KEY, token);
}

// PUBLIC_INTERFACE
export function getAuthToken() {
  /** Retrieves JWT token from localStorage. */
  return localStorage.getItem(TOKEN_KEY);
}

// PUBLIC_INTERFACE
export function clearAuthToken() {
  /** Removes JWT token from localStorage. */
  localStorage.removeItem(TOKEN_KEY);
}

// PUBLIC_INTERFACE
export function setUserRole(role) {
  /** Sets user role ('patient' or 'doctor'). */
  localStorage.setItem(USER_ROLE_KEY, role);
}

// PUBLIC_INTERFACE
export function getUserRole() {
  /** Gets user role ('patient' or 'doctor'). */
  return localStorage.getItem(USER_ROLE_KEY);
}

// PUBLIC_INTERFACE
export function clearUserRole() {
  /** Removes user role. */
  localStorage.removeItem(USER_ROLE_KEY);
}

// Auth Context for session management.
const AuthContext = createContext();

/**
 * AuthProvider wraps the app and provides authentication state.
 * - user: { role, ...profile }
 * - authenticated: boolean
 * - login, logout, register: async methods
 */
// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { role, ... }
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // On mount: load from storage
    const t = getAuthToken();
    const role = getUserRole();
    if (t && role) {
      setUser({ role });
      setToken(t);
    }
  }, []);

  // PUBLIC_INTERFACE
  const login = async ({ role, email, password }) => {
    setLoading(true);
    try {
      // Fetch API endpoint: /api/auth/{role}/login
      const resp = await fetch(`/api/auth/${role}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
      if (!resp.ok) throw new Error("Authentication failed");
      const data = await resp.json();
      if (!data.token) throw new Error("No token returned");
      setAuthToken(data.token);
      setUserRole(role);
      setUser({ role, ...data.user });
      setToken(data.token);
      setLoading(false);
      return { success: true };
    } catch (e) {
      setLoading(false);
      return { success: false, error: e.message };
    }
  };

  // PUBLIC_INTERFACE
  const register = async (payload) => {
    setLoading(true);
    try {
      // endpoint: /api/auth/{role}/register
      const { role, ...rest } = payload;
      const resp = await fetch(`/api/auth/${role}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rest)
      });
      if (!resp.ok) throw new Error("Registration failed");
      const data = await resp.json();
      if (!data.token) throw new Error("No token returned");
      setAuthToken(data.token);
      setUserRole(role);
      setUser({ role, ...data.user });
      setToken(data.token);
      setLoading(false);
      return { success: true };
    } catch (e) {
      setLoading(false);
      return { success: false, error: e.message };
    }
  };

  // PUBLIC_INTERFACE
  const logout = () => {
    clearAuthToken();
    clearUserRole();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authenticated: !!token && !!user,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useAuth() {
  return useContext(AuthContext);
}
