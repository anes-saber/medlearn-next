import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes via clsx", () => {
    expect(cn("base", false && "hidden", "block")).toBe("base block");
  });

  it("resolves tailwind conflicts (twMerge)", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });

  it("accepts arrays", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c");
  });

  it("handles undefined/null gracefully", () => {
    expect(cn("a", undefined, null, "b")).toBe("a b");
  });
});