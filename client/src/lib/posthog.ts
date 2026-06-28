/** No-op analytics stubs when PostHog is not configured. */

export function initPostHog(): void {}

export function isPostHogEnabled(): boolean {
  return false;
}

export function captureEvent(
  _name: string,
  _properties?: Record<string, string | number | boolean | null | undefined>,
): void {}

export function capturePageview(_path: string): void {}

export function identifyLead(
  _email: string,
  _properties?: { phone?: string; leadId?: number },
): void {}
