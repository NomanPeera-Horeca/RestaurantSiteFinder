export interface PhoneCountry {
  code: string;
  dial: string;
  label: string;
}

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: "US", dial: "+1", label: "United States" },
  { code: "CA", dial: "+1", label: "Canada" },
  { code: "GB", dial: "+44", label: "United Kingdom" },
  { code: "AU", dial: "+61", label: "Australia" },
  { code: "IN", dial: "+91", label: "India" },
  { code: "AE", dial: "+971", label: "UAE" },
  { code: "DE", dial: "+49", label: "Germany" },
  { code: "FR", dial: "+33", label: "France" },
  { code: "MX", dial: "+52", label: "Mexico" },
  { code: "SG", dial: "+65", label: "Singapore" },
];

export function formatPhoneWithDial(dial: string, localNumber: string): string {
  const digits = localNumber.replace(/\D/g, "");
  return `${dial}${digits}`;
}
