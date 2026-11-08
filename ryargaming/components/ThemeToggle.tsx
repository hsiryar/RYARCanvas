"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  function toggle() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode */
    }
    setDark(next === "dark");
  }

  return (
    <button
      className="icon-btn theme-btn"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
    >
      {dark ? (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0-5l1.9 4.1L18 4.6l-1.5 4.1L21 10l-4.1 1.9L18.5 16l-4.1-1.5L12.5 19l-1.9-4.1L6 16.5 7.5 12.4 3.4 10.5 7.5 8.6 6 4.5l4.1 1.5L12 2z" />
        </svg>
      ) : (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.3 3a9 9 0 108.7 11.3A7.5 7.5 0 0112.3 3z" />
        </svg>
      )}
    </button>
  );
}
