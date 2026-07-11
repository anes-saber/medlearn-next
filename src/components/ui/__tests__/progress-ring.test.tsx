import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgressRing from "../progress-ring";

describe("ProgressRing", () => {
  it("renders an SVG", () => {
    const { container } = render(<ProgressRing value={50} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders children when provided", () => {
    render(<ProgressRing value={50}>75%</ProgressRing>);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("clamps value above 100", () => {
    const { container } = render(<ProgressRing value={150} />);
    const circle = container.querySelector("circle:last-child");
    // offset at 100% = circumference - circumference = 0
    expect(circle?.getAttribute("stroke-dashoffset")).toBe("0");
  });

  it("clamps value below 0", () => {
    const { container } = render(<ProgressRing value={-10} />);
    const circle = container.querySelector("circle:last-child");
    const r = parseInt(circle?.getAttribute("r") ?? "0");
    const circumference = 2 * Math.PI * r;
    // offset at 0% = circumference - 0 = circumference
    expect(circle?.getAttribute("stroke-dashoffset")).toBe(String(circumference));
  });

  it("applies custom className", () => {
    const { container } = render(<ProgressRing value={50} className="my-class" />);
    expect(container.firstElementChild?.className).toContain("my-class");
  });
});