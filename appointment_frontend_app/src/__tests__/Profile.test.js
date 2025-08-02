import { render, screen } from "@testing-library/react";
import Profile from "../Profile";
import { AuthProvider } from "../auth";

test("renders loading profile by default", () => {
  render(<AuthProvider><Profile /></AuthProvider>);
  expect(screen.getByText(/loading your profile/i)).toBeInTheDocument();
});
