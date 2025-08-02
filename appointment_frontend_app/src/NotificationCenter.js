import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "./auth";

/**
 * Notification component to display real-time appointment updates and booking status.
 * Uses polling for demo (replace with WebSocket for true real-time in production).
 *
 * - Shows appointment status notifications (confirmed, rejected, etc.)
 * - Doctor: shows new incoming requests and status updates
 * - Patient: shows booking confirmations, cancellations, etc.
 * - Dismissible toasts (Airbnb-inspired).
 */

// Fake polling interval (ms)
const POLL_INTERVAL = 7000;

// Light notification icon (Airbnb-style)
const BellIcon = ({ filled }) => (
  <span style={{ fontSize: 23, verticalAlign: "middle" }}>
    {filled ? "🔔" : "🔕"}
  </span>
);

// Minimalist Toast style
function NotificationToast({ notification, onClose }) {
  const colors = {
    success: "#00A699",
    error: "#FF5A5F",
    info: "#767676",
    update: "#FFA500"
  };
  // Auto-close after 5s
  useEffect(() => {
    if (!notification.persistent) {
      const id = setTimeout(onClose, 5000);
      return () => clearTimeout(id);
    }
  }, [notification, onClose]);
  return (
    <div style={{
      background: "#fff",
      border: `1.3px solid ${colors[notification.type] || "#e9ecef"}`,
      boxShadow: "0 2px 11px 0 rgba(60,60,90,.07)",
      borderRadius: 8,
      padding: "13px 18px 12px 18px",
      display: "flex",
      minWidth: 240,
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 9,
      color: colors[notification.type] || "#222",
      position: "relative"
    }}>
      <span style={{ fontSize: 19, marginRight: 2 }}>
        {notification.type === "success" && "✅"}
        {notification.type === "error" && "❌"}
        {notification.type === "update" && "🔄"}
        {notification.type === "info" && "ℹ️"}
      </span>
      <div style={{ flex: "1 1 auto" }}>
        <div style={{
          fontWeight: 600,
          fontSize: 16,
          marginBottom: 1
        }}>{notification.title}</div>
        <div style={{
          fontSize: 14,
          color: "#767676"
        }}>{notification.message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: "absolute", right: 8, top: 6,
            border: "none", background: "none",
            color: "#FF5A5F", fontSize: 18,
            lineHeight: "1.5", cursor: "pointer"
          }}
          aria-label="Close notification"
        >×</button>
      )}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * NotificationCenter - displays in top bar, shows new system notifications.
 */
function NotificationCenter({ className = "", asSidebarLink = false }) {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const polling = useRef(null);

  // POLL: fetch notifications every X seconds. Backend endpoint: /api/{role}/notifications
  useEffect(() => {
    async function fetchNotifications() {
      if (!token || !user) return;
      let resp = await fetch(`/api/${user.role}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        let notif = await resp.json();
        if (Array.isArray(notif)) {
          setNotifications(notif.reverse()); // latest first
          // Count unread
          setUnread(notif.filter(n => n.unread !== false).length);
        }
      }
    }

    // Initial and polling setup
    fetchNotifications();
    polling.current = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(polling.current);
  }, [token, user]);

  const handleOpen = () => {
    setOpen(true);
    setUnread(0);
    // Optionally: PATCH /api/{role}/notifications/read_all (mark as read)
  };
  const handleClose = () => setOpen(false);

  // Dismiss notification
  const dismissNotification = idx => {
    setNotifications(notifications.filter((n, i) => i !== idx));
  };

  // Display location: asSidebarLink vs icon in nav
  if (asSidebarLink) {
    // Used for sidebar: shows unread badge
    return (
      <span style={{ display: "flex", alignItems: "center" }}>
        <BellIcon filled={unread > 0} />
        {unread > 0 ? (
          <span style={{
            background: "#FF5A5F",
            color: "#fff",
            borderRadius: "50%",
            padding: "1px 6px",
            fontSize: 12,
            marginLeft: 3,
            fontWeight: 600
          }}>{unread}</span>
        ) : null}
        <span style={{ marginLeft: 12 }}>Notifications</span>
      </span>
    );
  }

  // Used for navbar (icon only)
  return (
    <div className={className} style={{ position: "relative" }}>
      <button
        onClick={handleOpen}
        className="navbar__action"
        style={{
          border: "none",
          background: "none",
          boxShadow: "none",
          padding: "2px 12px",
          fontSize: 19,
          color: "#FF5A5F",
          position: "relative"
        }}
        aria-label="Notifications"
      >
        <BellIcon filled={unread > 0} />
        {unread > 0 &&
          <span style={{
            position: "absolute", top: 7, right: 5,
            background: "#FF5A5F", color: "#fff",
            fontSize: 12, padding: "2px 7px",
            borderRadius: "12px", fontWeight: 700
          }}>
            {unread}
          </span>
        }
      </button>
      {open &&
        <div style={{
          position: "absolute", right: 0, top: 40,
          zIndex: 1000, minWidth: 320,
          background: "#fff", border: "1.5px solid #FF5A5F",
          borderRadius: 11, boxShadow: "0 5px 25px 0 rgba(80,20,30,0.13)",
          maxHeight: 360, overflowY: "auto",
          padding: "13px 8px 11px 12px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontWeight: 700, color: "#FF5A5F", fontSize: 18 }}>Your Notifications</div>
            <button
              style={{ background: "none", border: "none", color: "#FF5A5F", fontSize: 19, cursor: "pointer" }}
              aria-label="Close"
              onClick={handleClose}
            >×</button>
          </div>
          {notifications.length === 0 ? (
            <div style={{ color: "#767676", fontSize: 15 }}>No notifications yet.</div>
          ) : (
            notifications.slice(0, 7).map((n, idx) => (
              <NotificationToast
                key={idx}
                notification={n}
                onClose={() => dismissNotification(idx)}
              />
            ))
          )}
        </div>
      }
    </div>
  );
}

export default NotificationCenter;
