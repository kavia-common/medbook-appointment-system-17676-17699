import React, { useEffect, useState } from "react";
import { useAuth } from "./auth";

/**
 * Simple Appointments listing for both patients and doctors.
 * - Patient: lists all past & future appointments (doctor, time, status)
 * - Doctor: lists all appointments/requests (patient, slot, status, with quick confirm/reject)
 */

// PUBLIC_INTERFACE
function AppointmentsListing() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [actionLoading, setActionLoading] = useState({}); // by appointment id

  // Fetch appts according to role
  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      setStatusMsg("");
      let url = "";
      if (!user || !token) { setLoading(false); return; }
      if (user.role === "patient")
        url = "/api/patient/appointments";
      else if (user.role === "doctor")
        url = "/api/doctor/appointments";
      let resp = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) {
        setStatusMsg("Failed to load appointments");
        setLoading(false);
        return;
      }
      let data = await resp.json();
      setAppointments(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    fetchAppointments();
  }, [user, token]);

  // For doctor: confirm/reject appointment requests
  const handleAction = async (id, action) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    setStatusMsg("");
    try {
      const resp = await fetch(`/api/appointment/${id}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("Action failed");
      await new Promise(r => setTimeout(r, 300)); // brief delay for effect
      setStatusMsg(`Appointment ${action}ed!`);
      setAppointments(appts =>
        appts.map(a => a.appointment_id === id ? { ...a, status: action === "confirm" ? "confirmed" : "rejected" } : a)
      );
    } catch (e) {
      setStatusMsg(e.message || "Action failed");
    }
    setActionLoading(prev => ({ ...prev, [id]: false }));
  };

  if (loading) {
    return (
      <div className="page page-card"><h2>Loading appointments...</h2></div>
    );
  }

  if (!user || !user.role) {
    return (
      <div className="page page-card"><h2>Please login.</h2></div>
    );
  }
  if (appointments.length === 0) {
    return (
      <div className="page page-card">
        <h2>Your Appointments</h2>
        <p>No appointments found.</p>
      </div>
    );
  }
  const isDoctor = user.role === "doctor";
  const isPatient = user.role === "patient";

  return (
    <div className="page page-card" style={{ maxWidth: 900 }}>
      <h1 style={{ color: "#FF5A5F", fontWeight: 700, marginBottom: 6 }}>
        {isPatient ? "My Bookings & Appointments" : "Appointments & Requests"}
      </h1>
      <div style={{ color: "#767676", fontSize: "1.1em", marginBottom: 27 }}>
        {isPatient ? "View all your upcoming and past appointments." :
          "Manage all your appointments and incoming booking requests."}
      </div>
      {statusMsg &&
        <div style={{
          color: statusMsg.includes("failed") ? "#FF5A5F" : "#00A699", marginBottom: 18
        }}>{statusMsg}</div>}
      <div>
        {appointments.map(appt => (
          <div key={appt.appointment_id || appt.id}
            style={{
              border: "1.1px solid #e9ecef",
              borderRadius: 13,
              background: "#fff",
              marginBottom: 22,
              boxShadow: "0 2px 14px 0 rgba(60,60,90,.05)",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "19px 23px"
            }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 18, color: "#1A1A1A", marginBottom: 5 }}>
                {isPatient ? (
                  <>With <span style={{ color: "#FF5A5F" }}>{appt.doctor_name}</span></>
                ) : (
                  <>Patient: <span style={{ color: "#FF5A5F" }}>{appt.patient_name || "Anonymous"}</span></>
                )}
              </div>
              <div style={{ fontSize: 15, color: "#767676", marginBottom: 4 }}>
                {appt.slot_date || appt.date} | {appt.slot_time || appt.time_range}
              </div>
              <div style={{ fontSize: 14, color: "#AAA" }}>
                Status: {appt.status || "pending"}
                {isPatient && appt.status === "confirmed" && (
                  <span style={{ color: "#00A699", fontWeight: 600, marginLeft: 9 }}>✔ Confirmed</span>
                )}
                {isPatient && appt.status === "rejected" && (
                  <span style={{ color: "#FF5A5F", fontWeight: 600, marginLeft: 9 }}>✖️ Rejected</span>
                )}
              </div>
            </div>
            {/* Doctor actions: pending requests */}
            {isDoctor && appt.status === "pending" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn navbar__action--primary"
                  style={{ padding: "6px 17px", minWidth: 64 }}
                  onClick={() => handleAction(appt.appointment_id || appt.id, "confirm")}
                  disabled={!!actionLoading[appt.appointment_id || appt.id]}
                >
                  {actionLoading[appt.appointment_id || appt.id] ? "..." : "Confirm"}
                </button>
                <button
                  className="btn"
                  style={{
                    padding: "6px 14px",
                    borderColor: "#FF5A5F",
                    color: "#FF5A5F",
                    minWidth: 60
                  }}
                  onClick={() => handleAction(appt.appointment_id || appt.id, "reject")}
                  disabled={!!actionLoading[appt.appointment_id || appt.id]}
                >
                  Reject
                </button>
              </div>
            )}
            {isDoctor && appt.status === "confirmed" && (
              <span style={{ color: "#00A699", fontWeight: 600 }}>Confirmed</span>
            )}
            {isDoctor && appt.status === "rejected" && (
              <span style={{ color: "#FF5A5F", fontWeight: 600 }}>Rejected</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AppointmentsListing;
