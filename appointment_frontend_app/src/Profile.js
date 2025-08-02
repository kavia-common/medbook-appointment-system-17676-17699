import React, { useEffect, useState } from "react";
import { useAuth } from "./auth";

/**
 * ProfilePage: Shows user info and allows edits.
 * - Patient: name, email, age, etc.
 * - Doctor: name, email, specialization, etc.
 * Editable, uses role to determine fields.
 */

// Helper: fetch user profile
async function fetchProfile(role, token) {
  let resp = await fetch(`/api/${role}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) return null;
  return await resp.json();
}

// Helper: save user profile
async function saveProfile(role, token, changes) {
  let resp = await fetch(`/api/${role}/me`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(changes)
  });
  return resp.ok;
}

function Profile() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(""); // "Saving...", "Saved!", error
  const [form, setForm] = useState({}); // Form state

  // Load user profile on mount
  useEffect(() => {
    async function load() {
      if (!user || !user.role || !token) return;
      let prof = await fetchProfile(user.role, token);
      setProfile(prof);
      setForm(prof || {});
    }
    load();
  }, [user, token]);

  if (!profile) {
    return (
      <div className="page page-card">
        <h2>Profile</h2>
        <div>Loading your profile...</div>
      </div>
    );
  }

  const handleEditToggle = () => {
    setEditing((e) => !e);
    setForm(profile);
    setStatus("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus("Saving...");
    const ok = await saveProfile(user.role, token, form);
    if (ok) {
      setStatus("Saved!");
      setProfile(form);
      setEditing(false);
    } else {
      setStatus("Error saving changes");
    }
  };

  // Render form fields tailored to role
  const renderFields = () => {
    if (user.role === "patient") {
      return (
        <>
          <div className="form-group">
            <label>Name</label>
            <input className="input" name="name" value={form.name || ""} onChange={handleChange} disabled={!editing} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="input" name="email" type="email" value={form.email || ""} onChange={handleChange} disabled={!editing} />
          </div>
          <div className="form-group">
            <label>Age</label>
            <input className="input" name="age" type="number" value={form.age || ""} onChange={handleChange} disabled={!editing} />
          </div>
        </>
      );
    }
    // doctor fields
    if (user.role === "doctor") {
      return (
        <>
          <div className="form-group">
            <label>Name</label>
            <input className="input" name="name" value={form.name || ""} onChange={handleChange} disabled={!editing} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="input" name="email" type="email" value={form.email || ""} onChange={handleChange} disabled={!editing} />
          </div>
          <div className="form-group">
            <label>Specialization</label>
            <input className="input" name="specialization" value={form.specialization || ""} onChange={handleChange} disabled={!editing} />
          </div>
        </>
      );
    }
    // generic info if unknown
    return Object.keys(form).map(key =>
      <div className="form-group" key={key}>
        <label>{key}</label>
        <input className="input" name={key} value={form[key] || ""} onChange={handleChange} disabled={!editing} />
      </div>
    );
  };

  return (
    <div className="page page-card">
      <h1>{user.role === "doctor" ? "Doctor" : "Patient"} Profile</h1>
      <form style={{ maxWidth: 450 }} onSubmit={handleSave}>
        {renderFields()}
        <div style={{ marginTop: 15 }}>
          {!editing ? (
            <button className="btn navbar__action--primary" type="button" onClick={handleEditToggle}>
              Edit Profile
            </button>
          ) : (
            <>
              <button className="btn navbar__action--primary" type="submit" style={{ marginRight: 10 }}>
                Save
              </button>
              <button className="btn" type="button" onClick={() => { setEditing(false); setForm(profile); }}>
                Cancel
              </button>
            </>
          )}
        </div>
        {status && (
          <div style={{ color: status.startsWith("Error") ? "#FF5A5F" : "#00A699", marginTop: 12 }}>{status}</div>
        )}
      </form>
    </div>
  );
}

export default Profile;
