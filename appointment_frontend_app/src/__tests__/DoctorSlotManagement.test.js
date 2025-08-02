import { render, screen } from "@testing-library/react";
import DoctorSlotManagement from "../DoctorSlotManagement";
import { AuthProvider } from "../auth";

test("renders slot management restricted if not doctor", () => {
  render(<AuthProvider><DoctorSlotManagement /></AuthProvider>);
  expect(screen.getByText(/access restricted/i)).toBeInTheDocument();
});
