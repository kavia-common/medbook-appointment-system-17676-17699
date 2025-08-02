import { render, screen } from "@testing-library/react";
import AppointmentsListing from "../AppointmentsListing";
import { AuthProvider } from "../auth";

test("renders appointments listing prompt", () => {
  render(<AuthProvider><AppointmentsListing /></AuthProvider>);
  expect(screen.getByText(/please login/i)).toBeInTheDocument();
});
