"use client";

import { useEffect } from "react";

export default function ThemeScript() {
  useEffect(() => {
    try {
      let theme = window.localStorage.getItem("medlearn-theme");
      if (!theme) {
        theme = window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";
      }
      if (theme === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      }
    } catch (e) {}
  }, []);

  return null;
}
