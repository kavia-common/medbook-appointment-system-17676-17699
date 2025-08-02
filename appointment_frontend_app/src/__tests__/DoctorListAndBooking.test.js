import { render, screen } from "@testing-library/react";
import DoctorListAndBooking from "../DoctorListAndBooking";
import { AuthProvider } from "../auth";

test("renders doctor booking heading", () => {
  render(<AuthProvider><DoctorListAndBooking /></AuthProvider>);
  expect(screen.getByText(/find a doctor/i)).toBeInTheDocument();
});
