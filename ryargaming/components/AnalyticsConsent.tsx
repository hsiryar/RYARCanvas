"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  notifyAdvertisingConsent,
  readAdvertisingConsent,
  readAnalyticsConsent,
  saveAdvertisingConsent,
  saveAnalyticsConsent,
  type ConsentValue,
} from "@/lib/consent";

const MEASUREMENT_ID = "G-7D13KEC3K9";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __ryarAnalyticsLoaded?: boolean;
    __ryarAdsterraLoaded?: boolean;
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
  if (readAnalyticsConsent() !== "granted" || !window.gtag) return;
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

function choiceLabel(choice: ConsentValue) {
  if (choice === "granted") return "Allowed";
  if (choice === "denied") return "Declined";
  return "Not yet chosen";
}

export default function AnalyticsConsent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [open, setOpen] = useState(false);
  const [analyticsChoice, setAnalyticsChoice] = useState<ConsentValue>(null);
  const [advertisingChoice, setAdvertisingChoice] = useState<ConsentValue>(null);

  useEffect(() => {
    const analytics = readAnalyticsConsent();
    const advertising = readAdvertisingConsent();
    setAnalyticsChoice(analytics);
    setAdvertisingChoice(advertising);

    if (analytics === "granted") startAnalytics();
    if (advertising === "granted") notifyAdvertisingConsent("granted");
    if (analytics === null || advertising === null) setOpen(true);

    const showPreferences = () => {
      setAnalyticsChoice(readAnalyticsConsent());
      setAdvertisingChoice(readAdvertisingConsent());
      setOpen(true);
    };
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
    if (readAnalyticsConsent() === "granted") {
      startAnalytics();
      trackPageView();
    }
  }, [pathname, query]);

  const saveChoices = (analytics: boolean, advertising: boolean) => {
    const analyticsValue = analytics ? "granted" : "denied";
    const advertisingValue = advertising ? "granted" : "denied";
    const shouldReload = Boolean(
      (window.__ryarAnalyticsLoaded && !analytics) ||
      (window.__ryarAdsterraLoaded && !advertising),
    );

    saveAnalyticsConsent(analyticsValue);
    saveAdvertisingConsent(advertisingValue);
    setAnalyticsChoice(analyticsValue);
    setAdvertisingChoice(advertisingValue);

    if (analytics) {
      startAnalytics();
      trackPageView();
    } else {
      stopAnalytics();
    }

    notifyAdvertisingConsent(advertisingValue);
    setOpen(false);
    if (shouldReload) window.location.reload();
  };

  const dismiss = () => setOpen(false);

  if (!open) return null;

  return (
    <aside
      className="analytics-consent"
      role="dialog"
      aria-labelledby="analytics-consent-title"
      aria-describedby="analytics-consent-copy"
    >
      <div className="analytics-consent-copy">
        <strong id="analytics-consent-title">Your privacy choices</strong>
        <p id="analytics-consent-copy">
          Google Analytics is optional analytics. Adsterra advertising runs only on RYAR Gaming. These are separate choices, and neither loads until you opt in.
        </p>
        <div className="analytics-consent-status" aria-live="polite">
          <span>Analytics: {choiceLabel(analyticsChoice)}</span>
          <span>Advertising: {choiceLabel(advertisingChoice)}</span>
        </div>
        <a href="/#/privacy-policy">Privacy details</a>
      </div>
      <div className="analytics-consent-actions">
        <button
          className="analytics-consent-accept"
          type="button"
          onClick={() => saveChoices(true, true)}
        >
          Allow all optional
        </button>
        <button
          className="analytics-consent-analytics-only"
          type="button"
          onClick={() => saveChoices(true, false)}
        >
          Allow analytics only
        </button>
        <button
          className="analytics-consent-ads-only"
          type="button"
          onClick={() => saveChoices(false, true)}
        >
          Allow ads only
        </button>
        <button
          className="analytics-consent-reject"
          type="button"
          onClick={() => saveChoices(false, false)}
        >
          Reject optional
        </button>
        <button className="analytics-consent-dismiss" type="button" onClick={dismiss}>
          Not now
        </button>
      </div>
    </aside>
  );
}
