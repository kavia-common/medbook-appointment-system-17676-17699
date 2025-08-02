import { render, screen } from "@testing-library/react";
import Dashboard from "../Dashboard";
import { AuthProvider } from "../auth";

test("renders loading dashboard initially", () => {
  render(<AuthProvider><Dashboard /></AuthProvider>);
  expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();
});
