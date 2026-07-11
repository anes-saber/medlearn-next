import { describe, it, expect } from "vitest";
import { isAdminOrTeacher, canAccessStudentContent } from "../rbac";

describe("isAdminOrTeacher", () => {
  it("returns true for admin", () => {
    expect(isAdminOrTeacher("admin")).toBe(true);
  });

  it("returns true for teacher", () => {
    expect(isAdminOrTeacher("teacher")).toBe(true);
  });

  it("returns false for paid-student", () => {
    expect(isAdminOrTeacher("paid-student")).toBe(false);
  });

  it("returns false for unpaid-student", () => {
    expect(isAdminOrTeacher("unpaid-student")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isAdminOrTeacher(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isAdminOrTeacher(undefined)).toBe(false);
  });
});

describe("canAccessStudentContent", () => {
  it("returns true for paid-student", () => {
    expect(canAccessStudentContent("paid-student")).toBe(true);
  });

  it("returns false for unpaid-student", () => {
    expect(canAccessStudentContent("unpaid-student")).toBe(false);
  });

  it("returns false for admin", () => {
    expect(canAccessStudentContent("admin")).toBe(false);
  });

  it("returns false for teacher", () => {
    expect(canAccessStudentContent("teacher")).toBe(false);
  });

  it("returns false for null", () => {
    expect(canAccessStudentContent(null)).toBe(false);
  });
});