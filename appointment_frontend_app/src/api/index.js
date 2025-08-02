//
// API UTILITIES & HOOKS LAYER FOR FASTAPI BACKEND (React)
//
// All code centralized here for backend REST, error handling, and easy DRY usage
//

// ---- General fetch API utility ----
export async function apiRequest(endpoint, {
  method = "GET",
  token = null,
  headers = {},
  body = null,
  params = null,
  ...rest
} = {}) {
  let url = endpoint.startsWith("http") ? endpoint : endpoint;
  // Handle query params
  if (params) {
    const qp = new URLSearchParams(params).toString();
    url += (url.includes("?") ? "&" : "?") + qp;
  }
  let fetchHeaders = { ...headers };
  if (token) fetchHeaders["Authorization"] = `Bearer ${token}`;
  if (body && !(body instanceof FormData)) {
    fetchHeaders["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }
  try {
    const resp = await fetch(url, {
      method,
      headers: fetchHeaders,
      body,
      ...rest
    });
    let data = null;
    // Try to JSON parse if possible
    try { data = await resp.json(); } catch { data = await resp.text(); }
    if (!resp.ok) {
      let msg = data && data.detail ? data.detail : (data && data.message) ? data.message : (typeof data === "string" ? data : "Unknown error");
      throw new Error(msg || "API Error");
    }
    return data;
  } catch (err) {
    throw new Error(err.message || "Network/API error");
  }
}

// ---- Auth hooks & endpoints ----
import { useState, useCallback } from "react";

// PUBLIC_INTERFACE
export function useApiAuth() {
  // login({ role, email, password }), register({...}), logout()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // PUBLIC_INTERFACE
  const login = useCallback(async ({ role, email, password }) => {
    setLoading(true); setError(null);
    try {
      const data = await apiRequest(`/api/auth/${role}/login`, {
        method: "POST",
        body: { email, password },
      });
      setLoading(false);
      return { success: true, ...data };
    } catch (e) {
      setLoading(false);
      setError(e.message);
      return { success: false, error: e.message };
    }
  }, []);

  // PUBLIC_INTERFACE
  const register = useCallback(async (payload) => {
    setLoading(true); setError(null);
    try {
      const { role, ...rest } = payload;
      const data = await apiRequest(`/api/auth/${role}/register`, {
        method: "POST",
        body: rest,
      });
      setLoading(false);
      return { success: true, ...data };
    } catch (e) {
      setLoading(false);
      setError(e.message);
      return { success: false, error: e.message };
    }
  }, []);

  return { login, register, loading, error };
}

// ---- Appointments Hooks ----
// PUBLIC_INTERFACE
export function useAppointments(token, role) {
  // Returns {appointments, loading, error, refresh, confirm/reject}
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true); setError(null);
    let url = "";
    if (role === "doctor") url = "/api/doctor/appointments";
    else if (role === "patient") url = "/api/patient/appointments";
    else { setLoading(false); setAppointments([]); return; }
    try {
      const data = await apiRequest(url, { token });
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [token, role]);

  // Actions
  const confirmAppointment = useCallback(
    async (appointment_id) => {
      await apiRequest(`/api/appointment/${appointment_id}/confirm`, { method: "POST", token });
    }, [token]
  );
  const rejectAppointment = useCallback(
    async (appointment_id) => {
      await apiRequest(`/api/appointment/${appointment_id}/reject`, { method: "POST", token });
    }, [token]
  );

  return {
    appointments,
    loading,
    error,
    refresh: fetchAppointments,
    confirmAppointment,
    rejectAppointment,
  };
}

// ---- Doctors and Slots ----
// PUBLIC_INTERFACE
export function useDoctors(token) {
  // Returns {doctors, loading, error, refresh}
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiRequest("/api/patient/doctors_with_slots", { token });
      setDoctors(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [token]);

  // Book a slot
  const bookAppointment = useCallback(
    async (slot_id) => {
      return await apiRequest("/api/patient/book_appointment", {
        method: "POST",
        token,
        body: { slot_id }
      });
    },
    [token]
  );

  return { doctors, loading, error, refresh: fetchDoctors, bookAppointment };
}

// PUBLIC_INTERFACE
export function useDoctorSlots(token) {
  // Returns {slots, loading, error, refresh, create, update, remove}
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSlots = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiRequest("/api/doctor/slots", { token });
      setSlots(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [token]);

  // CRUD for slots
  const createSlot = useCallback(
    async (slotData) => {
      return await apiRequest("/api/timeslot", { method: "POST", token, body: slotData });
    }, [token]
  );
  const updateSlot = useCallback(
    async (slot_id, slotData) => {
      return await apiRequest(`/api/timeslot/${slot_id}`, { method: "PUT", token, body: slotData });
    }, [token]
  );
  const removeSlot = useCallback(
    async (slot_id) => {
      return await apiRequest(`/api/timeslot/${slot_id}`, { method: "DELETE", token });
    }, [token]
  );

  return { slots, loading, error, refresh: fetchSlots, createSlot, updateSlot, removeSlot };
}

// ---- Profile ----
// PUBLIC_INTERFACE
export function useProfile(token, role) {
  // Returns {profile, loading, error, refresh, save}
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiRequest(`/api/${role}/me`, { token });
      setProfile(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [token, role]);

  const saveProfile = useCallback(
    async (changes) => {
      return await apiRequest(`/api/${role}/me`, {
        method: "PUT",
        token,
        body: changes
      });
    }, [token, role]
  );
  return { profile, loading, error, refresh: fetchProfile, saveProfile };
}

// ---- Notifications ----
// PUBLIC_INTERFACE
export function useNotifications(token, role) {
  // Returns {notifications, loading, error, refresh, markAllRead}
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiRequest(`/api/${role}/notifications`, { token });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [token, role]);

  const markAllRead = useCallback(async () => {
    // PATCH as example, but this endpoint needs to be supported backend
    await apiRequest(`/api/${role}/notifications/read_all`, { method: "PATCH", token });
  }, [token, role]);

  return { notifications, loading, error, refresh: fetchNotifications, markAllRead };
}
