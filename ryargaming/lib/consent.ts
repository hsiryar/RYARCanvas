export type ConsentValue = "granted" | "denied" | null;

export const ANALYTICS_CONSENT_KEY = "ryar-analytics-consent";
export const ADVERTISING_CONSENT_KEY = "ryar-advertising-consent";
export const ADVERTISING_CONSENT_EVENT = "ryar:advertising-consent";

let sessionAnalyticsConsent: ConsentValue = null;
let sessionAdvertisingConsent: ConsentValue = null;

function readStoredConsent(key: string, sessionValue: ConsentValue): ConsentValue {
  try {
    const value = window.localStorage.getItem(key);
    if (value === "granted" || value === "denied") return value;
  } catch {
    // Keep the choice in memory if browser storage is unavailable.
  }
  return sessionValue;
}

function saveStoredConsent(key: string, value: Exclude<ConsentValue, null>) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The choice still applies for this page session.
  }
}

export function readAnalyticsConsent(): ConsentValue {
  return readStoredConsent(ANALYTICS_CONSENT_KEY, sessionAnalyticsConsent);
}

export function readAdvertisingConsent(): ConsentValue {
  return readStoredConsent(ADVERTISING_CONSENT_KEY, sessionAdvertisingConsent);
}

export function saveAnalyticsConsent(value: Exclude<ConsentValue, null>) {
  sessionAnalyticsConsent = value;
  saveStoredConsent(ANALYTICS_CONSENT_KEY, value);
}

export function saveAdvertisingConsent(value: Exclude<ConsentValue, null>) {
  sessionAdvertisingConsent = value;
  saveStoredConsent(ADVERTISING_CONSENT_KEY, value);
}

export function notifyAdvertisingConsent(value: ConsentValue) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ADVERTISING_CONSENT_EVENT, { detail: value }));
}
