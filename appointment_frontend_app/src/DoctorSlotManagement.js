import React, { useState, useEffect } from "react";
import { useAuth } from "./auth";

/**
 * Fetch current doctor's slots from the backend.
 */
async function fetchDoctorSlots(token) {
  const resp = await fetch("/api/doctor/slots", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) return [];
  return await resp.json();
}

/**
 * Create a new timeslot.
 * slot: { date: YYYY-MM-DD, time_range: string (e.g., "14:00-15:00") }
 */
async function createSlot(slot, token) {
  const resp = await fetch("/api/timeslot", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(slot),
  });
  if (!resp.ok) throw new Error("Failed to create slot");
  return await resp.json();
}

/**
 * Update a timeslot (edit).
 */
async function updateSlot(slot_id, update, token) {
  const resp = await fetch(`/api/timeslot/${slot_id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(update),
  });
  if (!resp.ok) throw new Error("Failed to update slot");
  return await resp.json();
}

/**
 * Delete a timeslot.
 */
async function deleteSlot(slot_id, token) {
  const resp = await fetch(`/api/timeslot/${slot_id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) throw new Error("Failed to delete slot");
  return true;
}

/**
 * Fetch incoming appointment requests for this doctor.
 */
async function fetchDoctorAppointments(token) {
  const resp = await fetch("/api/doctor/appointments", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) return [];
  return await resp.json();
}

/**
 * Confirm or reject an appointment.
 * action: "confirm" or "reject"
 */
async function setAppointmentStatus(appointment_id, action, token) {
  const resp = await fetch(`/api/appointment/${appointment_id}/${action}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Failed to update appointment status");
  return await resp.json();
}

/**
 * Minimalist card-style form for editing or creating slots
 */
function SlotForm({ onSubmit, onCancel, defaultValue, submitting }) {
  const [date, setDate] = useState(defaultValue?.date || "");
  const [timeRange, setTimeRange] = useState(defaultValue?.time_range || "");
  return (
    <form
      style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        margin: "10px 0",
        flexWrap: "wrap",
      }}
      onSubmit={e => {
        e.preventDefault();
        if (!date || !timeRange) return;
        onSubmit({ date, time_range: timeRange.trim() });
      }}
    >
      <input
        type="date"
        className="input"
        required
        value={date}
        onChange={e => setDate(e.target.value)}
        style={{ flex: "0 0 140px" }}
      />
      <input
        type="text"
        className="input"
        required
        placeholder="Time Range (e.g., 14:00-15:00)"
        value={timeRange}
        onChange={e => setTimeRange(e.target.value)}
        pattern="^\d{2}:\d{2}-\d{2}:\d{2}$"
        title="Time Range format: HH:MM-HH:MM"
        style={{ flex: "0 0 185px" }}
      />
      <button
        className="btn navbar__action--primary"
        type="submit"
        disabled={submitting}
        style={{ minWidth: 70 }}
      >
        {defaultValue ? (submitting ? "Saving..." : "Save") : (submitting ? "Creating..." : "Add")}
      </button>
      <button
        className="btn"
        type="button"
        onClick={onCancel}
        disabled={submitting}
        style={{ minWidth: 50 }}
      >
        Cancel
      </button>
    </form>
  );
}

/**
 * Main component: Doctor's Slot and Appointment Management
 */
function DoctorSlotManagement() {
  const { user, token } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [creatingSlot, setCreatingSlot] = useState(false);
  const [slotFormLoading, setSlotFormLoading] = useState(false);
  const [slotError, setSlotError] = useState("");

  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [apptError, setApptError] = useState("");

  // Initial load
  useEffect(() => {
    if (!user || user.role !== "doctor" || !token) return;
    loadSlots();
    loadAppointments();
    // eslint-disable-next-line
  }, [user, token]);

  async function loadSlots() {
    setLoadingSlots(true);
    setSlotError("");
    try {
      const s = await fetchDoctorSlots(token);
      setSlots(Array.isArray(s) ? s : []);
    } catch (e) {
      setSlotError("Failed to fetch slots");
    }
    setLoadingSlots(false);
  }

  async function loadAppointments() {
    setLoadingAppointments(true);
    setApptError("");
    try {
      const appts = await fetchDoctorAppointments(token);
      setAppointments(Array.isArray(appts) ? appts : []);
    } catch {
      setApptError("Failed to fetch appointments");
    }
    setLoadingAppointments(false);
  }

  // Create new slot
  const handleCreateSlot = async slotData => {
    setSlotFormLoading(true);
    setSlotError("");
    try {
      await createSlot(slotData, token);
      setCreatingSlot(false);
      await loadSlots();
    } catch (e) {
      setSlotError(e.message);
    }
    setSlotFormLoading(false);
  };

  // Edit slot
  const handleEditSlot = slotId => {
    setEditingSlotId(slotId);
    setSlotError("");
  };
  const handleSaveSlot = async slotData => {
    setSlotFormLoading(true);
    setSlotError("");
    try {
      await updateSlot(editingSlotId, slotData, token);
      setEditingSlotId(null);
      await loadSlots();
    } catch (e) {
      setSlotError(e.message);
    }
    setSlotFormLoading(false);
  };

  // Delete slot
  const handleDeleteSlot = async slotId => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;
    setSlotFormLoading(true);
    setSlotError("");
    try {
      await deleteSlot(slotId, token);
      await loadSlots();
    } catch (e) {
      setSlotError(e.message);
    }
    setSlotFormLoading(false);
  };

  // Confirm/reject appointment
  const handleAppointmentAction = async (appointmentId, action) => {
    setActionLoading(prev => ({ ...prev, [appointmentId]: true }));
    setApptError("");
    try {
      await setAppointmentStatus(appointmentId, action, token);
      await loadAppointments();
    } catch (e) {
      setApptError(e.message);
    }
    setActionLoading(prev => ({ ...prev, [appointmentId]: false }));
  };

  if (!user || user.role !== "doctor") {
    return (
      <div className="page page-card">
        <h2>Access Restricted</h2>
        <p>This page is only available for authenticated doctors.</p>
      </div>
    );
  }

  return (
    <div className="page page-card" style={{ maxWidth: 880 }}>
      <h1
        style={{
          fontWeight: 700,
          color: "#FF5A5F",
          marginBottom: 0,
        }}
      >
        Manage Your Slots & Appointments
      </h1>
      <div style={{ color: "#767676", marginBottom: 18, fontSize: "1.05em" }}>
        Easily manage your time slots and review appointment requests. Clean, minimal design inspired by Airbnb.
      </div>

      {/* Section: Time Slot Management */}
      <section style={{ marginTop: 27 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ marginBottom: 6, color: "#1A1A1A" }}>Your Time Slots</h2>
          {!creatingSlot && (
            <button
              className="btn navbar__action--primary"
              style={{ padding: "8px 18px", fontWeight: 600 }}
              onClick={() => { setCreatingSlot(true); setEditingSlotId(null); }}
              disabled={slotFormLoading}
            >
              + Add Slot
            </button>
          )}
        </div>

        {slotError && <div style={{ color: "#FF5A5F", marginBottom: 8 }}>{slotError}</div>}

        {/* Add Slot Form */}
        {creatingSlot && (
          <SlotForm
            onSubmit={handleCreateSlot}
            onCancel={() => setCreatingSlot(false)}
            submitting={slotFormLoading}
          />
        )}

        {loadingSlots ? (
          <div style={{ color: "#767676", margin: 24 }}>Loading slots...</div>
        ) : (
          <div style={{ marginTop: 12 }}>
            {slots.length === 0 && <div style={{ color: "#767676" }}>No slots created yet.</div>}
            {slots.map(slot => (
              <div
                key={slot.slot_id || slot.id}
                style={{
                  border: "1px solid #ececec",
                  borderRadius: 11,
                  background: "#faf9f7",
                  padding: "15px 22px",
                  marginBottom: 13,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 2px 10px 0 rgba(60,60,90,.05)",
                }}
              >
                {editingSlotId === (slot.slot_id || slot.id) ? (
                  <SlotForm
                    onSubmit={handleSaveSlot}
                    onCancel={() => setEditingSlotId(null)}
                    defaultValue={slot}
                    submitting={slotFormLoading}
                  />
                ) : (
                  <>
                    <div>
                      <div style={{ fontSize: "1.12em", fontWeight: 600 }}>{slot.date}</div>
                      <div style={{ color: "#767676", fontSize: 15 }}>{slot.time_range}</div>
                      <div style={{ fontSize: 13, color: "#AAA" }}>Status: {slot.status || "active"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn"
                        style={{ padding: "6px 17px", fontSize: 14 }}
                        onClick={() => { setEditingSlotId(slot.slot_id || slot.id); setCreatingSlot(false); }}
                        disabled={slotFormLoading}
                      >
                        Edit
                      </button>
                      <button
                        className="btn"
                        style={{ padding: "6px 17px", fontSize: 14, color: "#FF5A5F", borderColor: "#FF5A5F" }}
                        onClick={() => handleDeleteSlot(slot.slot_id || slot.id)}
                        disabled={slotFormLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section: Appointment Requests */}
      <section style={{ marginTop: 50 }}>
        <h2 style={{ marginBottom: 5, color: "#1A1A1A" }}>Appointment Requests</h2>
        <div style={{ color: "#767676", marginBottom: 8, fontSize: 15 }}>
          Review, confirm, or reject incoming booking requests.
        </div>

        {apptError && <div style={{ color: "#FF5A5F", marginBottom: 8 }}>{apptError}</div>}

        {loadingAppointments ? (
          <div style={{ color: "#767676", margin: 24 }}>Loading requests...</div>
        ) : appointments.length === 0 ? (
          <div style={{ color: "#767676", margin: 11 }}>No appointment requests found.</div>
        ) : (
          <div style={{ marginTop: 10 }}>
            {appointments.map(req => (
              <div
                key={req.appointment_id || req.id}
                style={{
                  border: "1px solid #ececec",
                  borderRadius: 11,
                  background: "#fff",
                  padding: "14px 21px",
                  marginBottom: 15,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 2px 11px 0 rgba(60,60,90,.06)",
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 17, color: "#1A1A1A" }}>
                    {req.patient_name || req.patient || "Anonymous"}
                  </div>
                  <div style={{ color: "#767676", fontSize: 15 }}>
                    {req.slot_date || req.date} | {req.slot_time || req.time_range}
                  </div>
                  <div style={{ fontSize: 13, color: "#AAA" }}>
                    Status: {req.status || "pending"}
                  </div>
                  {req.reason && <div style={{ fontSize: 13, color: "#888" }}>Reason: {req.reason}</div>}
                </div>
                <div style={{ display: "flex", gap: 7, marginLeft: 5 }}>
                  {req.status === "pending" && (
                    <>
                      <button
                        className="btn navbar__action--primary"
                        style={{ padding: "6px 16px", minWidth: 64 }}
                        disabled={!!actionLoading[req.appointment_id || req.id]}
                        onClick={() => handleAppointmentAction(req.appointment_id || req.id, "confirm")}
                      >
                        {actionLoading[req.appointment_id || req.id] === true ? "Saving..." : "Confirm"}
                      </button>
                      <button
                        className="btn"
                        style={{
                          padding: "6px 16px",
                          borderColor: "#FF5A5F",
                          color: "#FF5A5F",
                          minWidth: 60,
                        }}
                        disabled={!!actionLoading[req.appointment_id || req.id]}
                        onClick={() => handleAppointmentAction(req.appointment_id || req.id, "reject")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {req.status === "confirmed" && (
                    <span style={{ color: "#00A699", fontWeight: 600, paddingLeft: 6 }}>
                      Confirmed
                    </span>
                  )}
                  {req.status === "rejected" && (
                    <span style={{ color: "#FF5A5F", fontWeight: 600, paddingLeft: 6 }}>
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DoctorSlotManagement;
