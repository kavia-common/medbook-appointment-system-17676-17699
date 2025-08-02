import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth";

/**
 * LoginForm - allows login as either patient/doctor.
 */
export function LoginForm() {
  const { login, loading } = useAuth();
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await login({ role, email, password });
    if (res.success) {
      navigate("/dashboard");
    } else {
      setError(res.error || "Login failed");
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} style={{ width: 320 }}>
      <h2 style={{ marginBottom: 22 }}>Login</h2>
      <div className="form-group">
        <label>Role</label>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button
            className={role === "patient" ? "btn btn-large navbar__action--primary" : "btn"}
            type="button"
            onClick={() => setRole("patient")}
            disabled={role === "patient"}
          >Patient</button>
          <button
            className={role === "doctor" ? "btn btn-large navbar__action--primary" : "btn"}
            type="button"
            onClick={() => setRole("doctor")}
            disabled={role === "doctor"}
          >Doctor</button>
        </div>
      </div>
      <div className="form-group">
        <input
          type="email"
          className="input"
          placeholder="Email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ marginBottom: 10, width: "100%" }}
        />
      </div>
      <div className="form-group">
        <input
          type="password"
          className="input"
          placeholder="Password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ marginBottom: 10, width: "100%" }}
        />
      </div>
      {error && <div style={{ color: "#FF5A5F", marginBottom: 8 }}>{error}</div>}
      <button
        className="btn btn-large navbar__action--primary"
        type="submit"
        style={{ width: "100%", marginBottom: 10 }}
        disabled={loading}
      >
        {loading ? "Signing in..." : "Login"}
      </button>
      <div style={{ marginTop: 12 }}>
        <span>Don't have an account? </span>
        <button
          className="btn-link"
          style={{ color: "#FF5A5F", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}
          type="button"
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </div>
    </form>
  );
}

/**
 * RegistrationForm - register as patient or doctor.
 * Doctor fields: name, email, password, specialization
 * Patient fields: name, email, password, age
 */
export function RegistrationForm() {
  const { register, loading } = useAuth();
  const [role, setRole] = useState("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Role-specific
  const [age, setAge] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    const base = { role, name, email, password };
    let additional = {};
    if (role === "patient") {
      additional = { age: Number(age) };
    } else {
      additional = { specialization };
    }
    const res = await register({ ...base, ...additional });
    if (res.success) {
      navigate("/dashboard");
    } else {
      setError(res.error || "Could not register");
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} style={{ width: 340 }}>
      <h2 style={{ marginBottom: 22 }}>Register</h2>
      <div className="form-group">
        <label>Role</label>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button
            className={role === "patient" ? "btn btn-large navbar__action--primary" : "btn"}
            type="button"
            onClick={() => setRole("patient")}
            disabled={role === "patient"}
          >Patient</button>
          <button
            className={role === "doctor" ? "btn btn-large navbar__action--primary" : "btn"}
            type="button"
            onClick={() => setRole("doctor")}
            disabled={role === "doctor"}
          >Doctor</button>
        </div>
      </div>
      <div className="form-group">
        <input
          type="text"
          className="input"
          placeholder="Full Name"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ marginBottom: 10, width: "100%" }}
        />
      </div>
      <div className="form-group">
        <input
          type="email"
          className="input"
          placeholder="Email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ marginBottom: 10, width: "100%" }}
        />
      </div>
      <div className="form-group">
        <input
          type="password"
          className="input"
          placeholder="Password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ marginBottom: 10, width: "100%" }}
        />
      </div>
      {
        role === "patient" ? (
          <div className="form-group">
            <input
              type="number"
              className="input"
              placeholder="Age"
              value={age}
              onChange={e => setAge(e.target.value)}
              required
              min={0}
              style={{ marginBottom: 10, width: "100%" }}
            />
          </div>
        ) : (
          <div className="form-group">
            <input
              type="text"
              className="input"
              placeholder="Specialization"
              value={specialization}
              onChange={e => setSpecialization(e.target.value)}
              required
              style={{ marginBottom: 10, width: "100%" }}
            />
          </div>
        )
      }
      {error && <div style={{ color: "#FF5A5F", marginBottom: 8 }}>{error}</div>}
      <button
        className="btn btn-large navbar__action--primary"
        type="submit"
        style={{ width: "100%", marginBottom: 10 }}
        disabled={loading}
      >
        {loading ? "Creating Account..." : "Register"}
      </button>
      <div style={{ marginTop: 10 }}>
        <span>Have an account? </span>
        <button
          className="btn-link"
          style={{
            color: "#FF5A5F", background: "none", border: "none",
            textDecoration: "underline", cursor: "pointer"
          }}
          type="button"
          onClick={() => navigate("/login")}
        >Login</button>
      </div>
    </form>
  );
}
