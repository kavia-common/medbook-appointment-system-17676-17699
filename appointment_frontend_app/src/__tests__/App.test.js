import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders login/register on start for unauthenticated", () => {
  render(<App />);
  expect(screen.getByText(/login/i)).toBeInTheDocument();
  expect(screen.getByText(/register/i)).toBeInTheDocument();
});
