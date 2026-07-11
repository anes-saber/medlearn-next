import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../card";

describe("Card components", () => {
  it("renders Card with content", () => {
    render(<Card>Content</Card>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders CardHeader", () => {
    render(<CardHeader>Header</CardHeader>);
    expect(screen.getByText("Header")).toBeInTheDocument();
  });

  it("renders CardTitle as h3", () => {
    render(<CardTitle>Title</CardTitle>);
    const heading = screen.getByRole("heading", { name: /title/i });
    expect(heading.tagName).toBe("H3");
  });

  it("renders CardDescription", () => {
    render(<CardDescription>Description</CardDescription>);
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("renders CardContent", () => {
    render(<CardContent>Body</CardContent>);
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("renders CardFooter", () => {
    render(<CardFooter>Footer</CardFooter>);
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});