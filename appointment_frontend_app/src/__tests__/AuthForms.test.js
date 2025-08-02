import { render, fireEvent, screen } from "@testing-library/react";
import { AuthProvider } from "../auth";
import { LoginForm, RegistrationForm } from "../AuthForms";

test("renders login form and switches role", () => {
  render(<AuthProvider><LoginForm /></AuthProvider>);
  expect(screen.getByText("Login")).toBeInTheDocument();
  fireEvent.click(screen.getByText("Doctor"));
  expect(screen.getByText("Doctor")).toBeDisabled();
  fireEvent.click(screen.getByText("Patient"));
  expect(screen.getByText("Patient")).toBeDisabled();
});

test("renders registration form, switches roles", () => {
  render(<AuthProvider><RegistrationForm /></AuthProvider>);
  expect(screen.getByText("Register")).toBeInTheDocument();
  fireEvent.click(screen.getByText("Doctor"));
  expect(screen.getByPlaceholderText("Specialization")).toBeInTheDocument();
  fireEvent.click(screen.getByText("Patient"));
  expect(screen.getByPlaceholderText("Age")).toBeInTheDocument();
});
