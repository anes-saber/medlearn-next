import { describe, it, expect } from "vitest";
import { validateFileUpload, validateFileUploads, MAX_FILE_SIZE } from "../validateFile";

function createMockFile(name: string, type: string, size: number): File {
  return new File([new ArrayBuffer(size)], name, { type });
}

describe("validateFileUpload", () => {
  it("accepts a valid PDF", () => {
    const file = createMockFile("doc.pdf", "application/pdf", 1024);
    expect(validateFileUpload(file)).toEqual({ valid: true });
  });

  it("rejects file exceeding max size", () => {
    const file = createMockFile("big.pdf", "application/pdf", MAX_FILE_SIZE + 1);
    expect(validateFileUpload(file).valid).toBe(false);
    expect(validateFileUpload(file).error).toContain("exceeds");
  });

  it("rejects empty file", () => {
    const file = createMockFile("empty.pdf", "application/pdf", 0);
    expect(validateFileUpload(file).valid).toBe(false);
    expect(validateFileUpload(file).error).toContain("empty");
  });

  it("rejects disallowed MIME type", () => {
    const file = createMockFile("script.js", "text/javascript", 100);
    expect(validateFileUpload(file).valid).toBe(false);
    expect(validateFileUpload(file).error).toContain("not allowed");
  });

  it("rejects dangerous extension", () => {
    const file = createMockFile("evil.exe", "application/pdf", 100);
    expect(validateFileUpload(file).valid).toBe(false);
    expect(validateFileUpload(file).error).toContain("dangerous");
  });
});

describe("validateFileUploads", () => {
  it("accepts single valid file", () => {
    const files = [createMockFile("doc.pdf", "application/pdf", 1024)];
    expect(validateFileUploads(files)).toEqual({ valid: true });
  });

  it("rejects more than max files", () => {
    const files = [
      createMockFile("a.pdf", "application/pdf", 100),
      createMockFile("b.pdf", "application/pdf", 100),
    ];
    expect(validateFileUploads(files).valid).toBe(false);
    expect(validateFileUploads(files).error).toContain("Maximum 1");
  });
});