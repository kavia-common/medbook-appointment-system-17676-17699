import React, { useEffect, useState } from "react";
import { useAuth } from "./auth";

/**
 * Fetches all available doctors and their open time slots from the backend.
 * @param {string} token JWT auth token
 * Returns a list: [{ id, name, specialization, slots: [{ slot_id, date, time_range, available }] }]
 */
async function fetchDoctorsWithSlots(token) {
  // Example endpoint, adjust as per your backend.
  const resp = await fetch("/api/patient/doctors_with_slots", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) return null;
  return await resp.json();
}

/**
 * Attempts to book an appointment for patient for the given slot.
 * @param {number|string} slotId
 * @param {string} token
 */
async function bookAppointment(slotId, token) {
  const resp = await fetch("/api/patient/book_appointment", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ slot_id: slotId })
  });
  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(msg || "Booking failed");
  }
  return await resp.json();
}

/**
 * DoctorListAndBookingPage - Lists all available doctors + available time slots.
 * Patients can book from available slots.
 */
function DoctorListAndBooking() {
  const { user, token } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingSlotId, setBookingSlotId] = useState(null); // slot being booked
  const [bookingStatus, setBookingStatus] = useState(""); // booking error/success

  // Fetch doctors once on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      setBookingStatus("");
      setBookingSlotId(null);
      if (!token) { setLoading(false); return; }
      const data = await fetchDoctorsWithSlots(token);
      setDoctors(data || []);
      setLoading(false);
    }
    load();
  }, [token]);

  // Show loading state
  if (loading) {
    return (
      <div className="page page-card">
        <h2>Doctor List</h2>
        <p>Loading doctors and slots...</p>
      </div>
    );
  }

  // Filter out when no doctors returned
  if (!Array.isArray(doctors) || doctors.length === 0) {
    return (
      <div className="page page-card">
        <h2>Doctor List</h2>
        <p>No doctors with available slots at this time.</p>
      </div>
    );
  }

  // Handler for booking a slot
  const handleBook = async (slotId) => {
    setBookingSlotId(slotId);
    setBookingStatus("");
    try {
      await bookAppointment(slotId, token);
      setBookingStatus("Successfully booked! 🎉");
      // Refresh doctor/slot info to reflect updated availability
      const updatedList = await fetchDoctorsWithSlots(token);
      setDoctors(updatedList || []);
    } catch (err) {
      setBookingStatus("Booking failed: " + (err.message || "Unknown error"));
    } finally {
      setBookingSlotId(null);
    }
  };

  return (
    <div className="page page-card">
      <h1 style={{ marginBottom: 22 }}>Find a Doctor and Book a Slot</h1>
      <p style={{
        color: "#767676",
        marginBottom: 30,
        fontSize: "1.1rem"
      }}>
        Browse doctors, view their available time slots, and instantly book your appointment. <br />
        <span style={{ fontSize: "0.97em" }}>Modern, minimal UI inspired by Airbnb.</span>
      </p>
      {bookingStatus && (
        <div style={{ color: bookingStatus.startsWith("Successfully") ? "#00A699" : "#FF5A5F", marginBottom: 24 }}>
          {bookingStatus}
        </div>
      )}
      <div>
        {
          doctors.map(doc => (
            <div key={doc.id}
              style={{
                border: "1px solid #e9ecef",
                borderRadius: 14,
                marginBottom: 28,
                boxShadow: "0 2px 11px 0 rgba(60,60,90,.07)",
                background: "#fff",
                padding: "26px 32px"
              }}>
              <div style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "start",
                gap: 16
              }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ color: "#FF5A5F", margin: 0, fontWeight: 600 }}>{doc.name}</h2>
                  <div style={{ color: "#767676", marginBottom: 2 }}>{doc.specialization}</div>
                  <div style={{ fontSize: 15, color: "#767676" }}>Doctor ID: {doc.id}</div>
                </div>
                {/* Doctor avatar placeholder */}
                <div style={{
                  minWidth: 56, minHeight: 56,
                  borderRadius: "50%", background: "#FFF4F2",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 25, fontWeight: 700, color: "#FF5A5F"
                }}>
                  {doc.name ? doc.name[0].toUpperCase() : <span>👨‍⚕️</span>}
                </div>
              </div>
              {/* Slots table */}
              <div style={{ marginTop: 18, borderTop: "1px solid #eee", paddingTop: 10 }}>
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "19px 26px"
                }}>
                  {(Array.isArray(doc.slots) && doc.slots.length > 0) ? (
                    doc.slots.filter(slot => slot.available).length > 0 ? (
                      doc.slots.filter(slot => slot.available).map(slot => (
                        <div key={slot.slot_id}
                          style={{
                            border: "1.1px solid #fde7e4",
                            borderRadius: 10,
                            padding: "14px 19px",
                            background: "#FFF4F2",
                            minWidth: 170,
                            marginBottom: 4
                          }}>
                          <div style={{ fontWeight: 600, marginBottom: 3 }}>
                            {slot.date}
                          </div>
                          <div style={{
                            color: "#767676", fontSize: 15, marginBottom: 7
                          }}>{slot.time_range}</div>
                          <button
                            disabled={bookingSlotId === slot.slot_id}
                            className="btn navbar__action--primary"
                            style={{
                              fontSize: 15, padding: "6px 15px",
                              width: "100%",
                              borderRadius: 6,
                              opacity: bookingSlotId === slot.slot_id ? 0.6 : 1
                            }}
                            onClick={() => handleBook(slot.slot_id)}
                          >
                            {bookingSlotId === slot.slot_id ? "Booking..." : "Book"}
                          </button>
                        </div>
                      ))
                    ) : (
                      <span style={{ color: "#767676", fontSize: 15 }}>
                        No available slots.
                      </span>
                    )
                  ) : (
                    <span style={{ color: "#767676", fontSize: 15 }}>
                      No slots listed.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        }
      </div>
      <div style={{
        textAlign: "center",
        color: "#AAA",
        fontSize: "0.98em",
        marginTop: 25
      }}>
        Can't find your doctor? Contact support or try again later.
      </div>
    </div>
  );
}

export default DoctorListAndBooking;
