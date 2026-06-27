export const RENT_STRESS_STORAGE_KEY = "rsf_rent_stress_test";

export interface RentStressData {
  monthlyRent: number;
  monthlyRevenueNeeded: number;
  dailyCovers: number;
  seatTurnover: number;
  risk: "safe" | "tight" | "high";
  pricePointLabel: string;
}

export function loadRentStressData(): RentStressData | null {
  try {
    const raw = localStorage.getItem(RENT_STRESS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RentStressData;
  } catch {
    return null;
  }
}
