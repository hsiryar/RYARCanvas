"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const MEASUREMENT_ID = "G-7D13KEC3K9";
const CONSENT_KEY = "ryar-analytics-consent";
let sessionConsent: "granted" | "denied" | null = null;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __ryarAnalyticsLoaded?: boolean;
  }
}

function readConsent(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_KEY) || sessionConsent;
  } catch {
    return sessionConsent;
  }
}

function saveConsent(value: "granted" | "denied") {
  sessionConsent = value;
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // The choice still applies for the current page if browser storage is unavailable.
  }
}

function startAnalytics() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function (...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  if (window.__ryarAnalyticsLoaded) {
    window.gtag("consent", "update", { analytics_storage: "granted" });
    return;
  }

  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, { send_page_view: false });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  script.dataset.ryarAnalytics = "true";
  document.head.appendChild(script);
  window.__ryarAnalyticsLoaded = true;
}

function trackPageView() {
  if (readConsent() !== "granted" || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: `${window.location.pathname}${window.location.search}`,
    page_location: window.location.href,
    page_title: document.title,
  });
}

function stopAnalytics() {
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  const names = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0].trim())
    .filter((name) => /^_ga($|_)/.test(name));
  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname}; SameSite=Lax`;
  }
}

export default function AnalyticsConsent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const current = readConsent();
    if (current === "granted") startAnalytics();
    else if (current !== "denied") setOpen(true);

    const showPreferences = () => setOpen(true);
    const onPreferenceClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("[data-open-consent]")) {
        event.preventDefault();
        showPreferences();
      }
    };
    document.addEventListener("click", onPreferenceClick);
    window.addEventListener("ryar:open-consent", showPreferences);
    return () => {
      document.removeEventListener("click", onPreferenceClick);
      window.removeEventListener("ryar:open-consent", showPreferences);
    };
  }, []);

  useEffect(() => {
    if (readConsent() === "granted") {
      startAnalytics();
      trackPageView();
    }
  }, [pathname, query]);

  const accept = () => {
    saveConsent("granted");
    startAnalytics();
    trackPageView();
    setOpen(false);
  };

  const reject = () => {
    const shouldReload = Boolean(window.__ryarAnalyticsLoaded);
    saveConsent("denied");
    stopAnalytics();
    setOpen(false);
    if (shouldReload) window.location.reload();
  };

  const dismiss = () => setOpen(false);

  if (!open) return null;

  return (
    <aside className="analytics-consent" role="dialog" aria-labelledby="analytics-consent-title" aria-describedby="analytics-consent-copy">
      <div className="analytics-consent-copy">
        <strong id="analytics-consent-title">Your privacy choices</strong>
        <p id="analytics-consent-copy">
          Allow Google Analytics to measure page views and selected site interactions so we can understand how the archive is used. It stays off unless you accept.
        </p>
        <a href="/#/privacy-policy">Privacy details</a>
      </div>
      <div className="analytics-consent-actions">
        <button className="analytics-consent-accept" type="button" onClick={accept}>Accept analytics</button>
        <button className="analytics-consent-reject" type="button" onClick={reject}>Reject</button>
        <button className="analytics-consent-dismiss" type="button" onClick={dismiss}>Not now</button>
      </div>
    </aside>
  );
}
