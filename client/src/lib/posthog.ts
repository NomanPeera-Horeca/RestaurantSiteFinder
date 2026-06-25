import posthog from "posthog-js";

const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const host = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || "https://us.i.posthog.com";

let initialized = false;

export function initPostHog(): void {
  if (initialized || typeof window === "undefined" || !key?.trim()) return;

  posthog.init(key.trim(), {
    api_host: host.trim(),
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
    session_recording: {
      maskAllInputs: true,
    },
  });
  initialized = true;
}

export function isPostHogEnabled(): boolean {
  return initialized;
}

export function captureEvent(
  name: string,
  properties?: Record<string, string | number | boolean | null | undefined>
): void {
  if (!initialized) return;
  const clean: Record<string, string | number | boolean> = {};
  if (properties) {
    for (const [k, v] of Object.entries(properties)) {
      if (v !== undefined && v !== null) clean[k] = v;
    }
  }
  posthog.capture(name, clean);
}

export function capturePageview(path: string): void {
  if (!initialized) return;
  posthog.capture("$pageview", { $current_url: window.location.origin + path });
}
