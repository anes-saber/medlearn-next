import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../input";

describe("Input", () => {
  it("renders with placeholder", () => {
    render(<Input placeholder="Enter name" />);
    expect(screen.getByPlaceholderText("Enter name")).toBeInTheDocument();
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    render(<Input />);
    const input = screen.getByRole("textbox");
    await user.type(input, "hello");
    expect(input).toHaveValue("hello");
  });

  it("forwards ref", () => {
    const ref = { current: null };
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("applies custom className", () => {
    render(<Input className="custom-class" />);
    expect(screen.getByRole("textbox").className).toContain("custom-class");
  });
});