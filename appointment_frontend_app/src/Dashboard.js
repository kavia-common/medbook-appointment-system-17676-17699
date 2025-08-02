import React, { useEffect, useState } from "react";
import { useAuth } from "./auth";

// Helper to fetch dashboard data (stub for real endpoint)
async function fetchDashboardInfo(role, token) {
  // You might change this URL to match backend endpoints (e.g., /api/{role}/dashboard)
  let resp = await fetch(`/api/${role}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) return null;
  return await resp.json();
}

/**
 * DashboardPage: Shows dashboard info for patient/doctor.
 * - Patient: Next appt, doctor list, quick-book, etc.
 * - Doctor: Next appt, slot summary, confirm tasks, etc.
 */
function Dashboard() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    async function load() {
      if (!user || !user.role || !token) return;
      setLoading(true);
      let data = await fetchDashboardInfo(user.role, token);
      setDashboard(data);
      setLoading(false);
    }
    load();
  }, [user, token]);

  if (loading)
    return (
      <div className="page">
        <h2>Loading dashboard...</h2>
      </div>
    );

  if (!dashboard)
    return (
      <div className="page">
        <h2>Dashboard</h2>
        <p>Could not load dashboard info.</p>
      </div>
    );

  // Render role-specific dashboard blocks
  if (user.role === "patient") {
    return (
      <div className="page page-card">
        <h1>Patient Dashboard</h1>
        {dashboard.next_appointment ? (
          <div>
            <h3>Next Appointment</h3>
            <p>
              {dashboard.next_appointment.date} at {dashboard.next_appointment.time} with{" "}
              <strong>{dashboard.next_appointment.doctor_name}</strong>
            </p>
          </div>
        ) : (
          <p>No upcoming appointments.</p>
        )}
        <div style={{ marginTop: 32 }}>
          <h3>My Doctors</h3>
          <ul>
            {(dashboard.doctor_list || []).map((doc) => (
              <li key={doc.id}>
                {doc.name} &mdash; {doc.specialization}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Doctor role
  if (user.role === "doctor") {
    return (
      <div className="page page-card">
        <h1>Doctor Dashboard</h1>
        {dashboard.next_appointment ? (
          <div>
            <h3>Next Appointment</h3>
            <p>
              {dashboard.next_appointment.date} at {dashboard.next_appointment.time} with patient{" "}
              <strong>{dashboard.next_appointment.patient_name}</strong>
            </p>
          </div>
        ) : (
          <p>No upcoming appointments.</p>
        )}

        <div style={{ marginTop: 32 }}>
          <h3>Your Slots</h3>
          <ul>
            {(dashboard.slots || []).map((slot, idx) => (
              <li key={idx}>
                {slot.date} - {slot.time_range} ({slot.status})
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="page page-card">
      <h1>Dashboard</h1>
      <p>Unknown user type.</p>
    </div>
  );
}

export default Dashboard;
