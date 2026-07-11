import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "../LanguageContext";

describe("LanguageContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubEnv("NODE_ENV", "development");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to English", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    expect(result.current.language).toBe("en");
    expect(result.current.t("login.title")).toBe("Sign In");
  });

  it("translates keys to English", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    expect(result.current.t("login.title")).toBe("Sign In");
  });

  it("switches language to French", async () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });

    await act(async () => {
      result.current.setLanguage("fr");
    });

    expect(result.current.language).toBe("fr");
    expect(result.current.t("login.title")).toBe("Connexion");
  });

  it("stores language preference in localStorage", async () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });

    await act(async () => {
      result.current.setLanguage("fr");
    });

    expect(window.localStorage.getItem("medlearn-lang")).toBe("fr");
  });

  it("throws error when used outside provider", () => {
    expect(() => renderHook(() => useLanguage())).toThrow(
      "useLanguage must be used within LanguageProvider",
    );
  });
});