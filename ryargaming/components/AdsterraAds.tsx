"use client";

import { useEffect, useState } from "react";
import {
  ADVERTISING_CONSENT_EVENT,
  ADVERTISING_CONSENT_KEY,
  readAdvertisingConsent,
} from "@/lib/consent";

const POPUNDER_SRC = "https://afders.org/1/fe15502fb6e9a65db86c96c3f7f93c67";
const NATIVE_BANNER_SRC = "https://bicea.org/21/ef077883c68704acce27f91ac780ef95";
const NATIVE_BANNER_CONTAINER = "container-ef077883c68704acce27f91ac780ef95";
const SMARTLINK_URL = "https://arwf.org/4/9e0df12829448ca5a185956b27bb1d21";
const SOCIAL_BAR_SRC = "https://bicea.org/14/1d481e65ada539638a70bd66578b04dd";

function appendAdScript(key: string, src: string, parent: HTMLElement, async: boolean) {
  if (document.querySelector(`script[data-ryar-adsterra="${key}"]`)) return;

  const script = document.createElement("script");
  script.src = src;
  script.async = async;
  script.setAttribute("data-cfasync", "false");
  script.dataset.ryarAdsterra = key;
  parent.appendChild(script);
  window.__ryarAdsterraLoaded = true;
}

function removeAdScripts() {
  document.querySelectorAll("script[data-ryar-adsterra]").forEach((script) => script.remove());
}

export default function AdsterraAds() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const syncConsent = () => setEnabled(readAdvertisingConsent() === "granted");
    const onConsentChange = (event: Event) => {
      const choice = (event as CustomEvent<string | null>).detail;
      setEnabled(choice === "granted");
    };
    const onStorageChange = (event: StorageEvent) => {
      if (event.key !== ADVERTISING_CONSENT_KEY) return;
      if (window.__ryarAdsterraLoaded && event.newValue !== "granted") {
        window.location.reload();
        return;
      }
      syncConsent();
    };

    syncConsent();
    window.addEventListener(ADVERTISING_CONSENT_EVENT, onConsentChange);
    window.addEventListener("storage", onStorageChange);
    return () => {
      window.removeEventListener(ADVERTISING_CONSENT_EVENT, onConsentChange);
      window.removeEventListener("storage", onStorageChange);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      removeAdScripts();
      return;
    }

    const nativeContainer = document.getElementById(NATIVE_BANNER_CONTAINER);
    if (!nativeContainer) return;

    // These tags are inserted only after the visitor has opted in to advertising.
    appendAdScript("popunder", POPUNDER_SRC, document.head, false);
    appendAdScript("native-banner", NATIVE_BANNER_SRC, document.body, true);
    appendAdScript("social-bar", SOCIAL_BAR_SRC, document.body, false);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <aside className="adsterra-placements" aria-label="Sponsored advertising">
      <section className="adsterra-native" aria-label="Advertisement">
        <span className="adsterra-label">Advertisement</span>
        <div id={NATIVE_BANNER_CONTAINER} className="adsterra-native-container" />
      </section>
      <div className="adsterra-smartlink">
        <span className="adsterra-label">Sponsored</span>
        <a
          href={SMARTLINK_URL}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          aria-label="Open sponsored offer in a new tab"
        >
          View sponsored offer <span aria-hidden="true">↗</span>
        </a>
      </div>
    </aside>
  );
}

declare global {
  interface Window {
    __ryarAdsterraLoaded?: boolean;
  }
}
