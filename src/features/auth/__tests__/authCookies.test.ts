import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";

// We'll test the pure logic: VALID_ROLES check by examining what setRoleCookie does
// with valid vs invalid roles.
import { setRoleCookie, clearRoleCookie } from "../actions/authCookies";

const mockCookieStore = {
  set: vi.fn(),
  delete: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);
});

describe("auth cookie actions", () => {
  it("sets cookie for valid role", async () => {
    await setRoleCookie("admin");
    expect(mockCookieStore.set).toHaveBeenCalledWith("user_role", "admin", expect.any(Object));
  });

  it("sets cookie for paid-student", async () => {
    await setRoleCookie("paid-student");
    expect(mockCookieStore.set).toHaveBeenCalledWith("user_role", "paid-student", expect.any(Object));
  });

  it("does not set cookie for invalid role", async () => {
    await setRoleCookie("superadmin");
    expect(mockCookieStore.set).not.toHaveBeenCalled();
  });

  it("clears the role cookie", async () => {
    await clearRoleCookie();
    expect(mockCookieStore.delete).toHaveBeenCalledWith("user_role");
  });
});