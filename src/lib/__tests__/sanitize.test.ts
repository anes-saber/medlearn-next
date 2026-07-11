import { describe, it, expect } from "vitest";
import { stripHtml, stripScripts, sanitizeText, truncate, isLanguageCode, isUUID, isEmail } from "../sanitize";

describe("stripHtml", () => {
  it("removes HTML tags", () => {
    expect(stripHtml("<p>Hello</p>")).toBe("Hello");
  });

  it("removes nested tags", () => {
    expect(stripHtml("<div><span>nested</span></div>")).toBe("nested");
  });

  it("returns empty string for only tags", () => {
    expect(stripHtml("<br/>")).toBe("");
  });

  it("returns same string when no tags", () => {
    expect(stripHtml("plain text")).toBe("plain text");
  });
});

describe("stripScripts", () => {
  it("removes javascript: URIs", () => {
    expect(stripScripts('javascript:alert(1)')).toBe('alert(1)');
  });

  it("removes on* event handlers", () => {
    expect(stripScripts('onclick=alert(1)')).toBe('alert(1)');
  });
});

describe("sanitizeText", () => {
  it("strips HTML and scripts and trims", () => {
    expect(sanitizeText('  <p onclick="x">hello</p>  ')).toBe('hello');
  });
});

describe("truncate", () => {
  it("returns input if within maxLen", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates with ellipsis", () => {
    const result = truncate("hello world", 5);
    expect(result).toBe("hell…");
    expect(result.length).toBe(5);
  });
});

describe("isLanguageCode", () => {
  it("accepts 'en'", () => {
    expect(isLanguageCode("en")).toBe(true);
  });

  it("accepts 'fr'", () => {
    expect(isLanguageCode("fr")).toBe(true);
  });

  it("accepts 'en-US'", () => {
    expect(isLanguageCode("en-US")).toBe(true);
  });

  it("rejects 'english'", () => {
    expect(isLanguageCode("english")).toBe(false);
  });
});

describe("isUUID", () => {
  it("accepts valid UUID v4", () => {
    expect(isUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("rejects short string", () => {
    expect(isUUID("not-a-uuid")).toBe(false);
  });
});

describe("isEmail", () => {
  it("accepts valid email", () => {
    expect(isEmail("user@example.com")).toBe(true);
  });

  it("rejects missing @", () => {
    expect(isEmail("userexample.com")).toBe(false);
  });
});