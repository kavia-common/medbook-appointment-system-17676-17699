# API Integration Layer: React <-> FastAPI

## Overview

This directory contains all central API utility functions and custom React hooks for interacting with the FastAPI backend. These utilities provide:
- A reusable, DRY way to make authenticated requests with error handling.
- Custom hooks (e.g. `useAppointments`, `useDoctors`, `useProfile`, `useNotifications`) that encapsulate REST calls and return useful loading/error/data state for React components.
- Centralized place to update/extend API interactions as the backend evolves.

## Structure

- **index.js**: Contains the reusable API functions and all exported React hooks.

## Usage Patterns

- **Authentication:**  
  Use `useApiAuth` to get `login`, `register` functions and authentication error/loading state.

- **Appointments:**  
  Use `useAppointments(token, role)` to get appointments list, loading state, error, refresh function, and actions to confirm/reject.

- **Doctors & Booking:**  
  Use `useDoctors(token)` to list doctors and slots and to book appointments.

- **Slots (Doctor):**  
  Use `useDoctorSlots(token)` for CRUD operations on your own slots.

- **Profile:**  
  Use `useProfile(token, role)` for loading & updating user profiles.

- **Notifications:**  
  Use `useNotifications(token, role)` for poll-based notification center.

## Example

```js
import { useAppointments } from "./api";
const { appointments, loading, error, refresh, confirmAppointment } = useAppointments(token, role);
```

## Error Handling

All hooks and fetch utilities centralize error handling. Errors will be available on the returned hook state. Use try/catch if calling utility functions directly.
