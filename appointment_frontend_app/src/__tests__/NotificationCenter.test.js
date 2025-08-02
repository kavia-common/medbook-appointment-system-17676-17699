import { render, screen } from "@testing-library/react";
import NotificationCenter from "../NotificationCenter";
import { AuthProvider } from "../auth";

test("renders notifications badge in sidebar", () => {
  render(<AuthProvider><NotificationCenter asSidebarLink={true} /></AuthProvider>);
  expect(screen.getByText(/notifications/i)).toBeInTheDocument();
});
