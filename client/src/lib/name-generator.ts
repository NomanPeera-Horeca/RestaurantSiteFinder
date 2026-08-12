export const CUISINE_OPTIONS = [
  { value: "italian", label: "Italian / Pizza" },
  { value: "mexican", label: "Mexican / Tex-Mex" },
  { value: "burger", label: "Burger / American" },
  { value: "asian", label: "Asian Fusion / Sushi" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "bbq", label: "BBQ / Smokehouse" },
  { value: "cafe", label: "Café / Coffee Shop" },
  { value: "bakery", label: "Bakery / Desserts" },
  { value: "fast-casual", label: "Fast Casual / Bowl" },
  { value: "fine-dining", label: "Fine Dining" },
  { value: "seafood", label: "Seafood" },
  { value: "indian", label: "Indian / Pakistani" },
  { value: "other", label: "Other (free text)" },
] as const;

export type CuisineKey = (typeof CUISINE_OPTIONS)[number]["value"];

export const VIBE_OPTIONS = [
  "Bold & Modern",
  "Warm & Family",
  "Upscale & Elegant",
  "Fun & Casual",
  "Local & Authentic",
  "Fast & Fresh",
  "Rustic & Homemade",
  "Trendy & Social",
] as const;

export type VibeKey = (typeof VIBE_OPTIONS)[number];

const CHAIN_BLOCKLIST = [
  "mcdonald",
  "subway",
  "starbucks",
  "chipotle",
  "olive garden",
  "applebee",
  "chili's",
  "denny",
  "ihop",
  "taco bell",
  "pizza hut",
  "domino",
  "kfc",
  "wendy",
  "burger king",
  "panera",
];

const CUISINE_BANKS: Record<
  string,
  { food: string[]; nouns: string[]; characters: string[]; bold: string[]; evocative: [string, string][] }
> = {
  italian: {
    food: ["Ember", "Oven", "Fold", "Marinara", "Trattoria", "Nonna", "Rustica", "Forno"],
    nouns: ["Pasta", "Crust", "Basil", "Olive", "Flour", "Fire"],
    characters: ["Rosa", "Marco", "Lucia", "Vito", "Gina"],
    bold: ["FORNO", "EMBER", "RUSTICA", "NONNA", "FIORE"],
    evocative: [["Golden", "Crust"], ["Iron", "Fork"], ["Salt", "Stone"], ["Little", "Italy"]],
  },
  mexican: {
    food: ["Masa", "Agave", "Casa", "Fuego", "Salsa", "Cantina", "Taco", "Azul"],
    nouns: ["Masa", "Agave", "Chile", "Lime", "Comal", "Smoke"],
    characters: ["Rosa", "Manny", "Vega", "Carmen", "Diego"],
    bold: ["MASA", "AGAVE", "FUERTE", "AZUL", "COMAL"],
    evocative: [["Salt", "Smoke"], ["Fire", "Fold"], ["Golden", "Rule"], ["Smoke", "Signal"]],
  },
  burger: {
    food: ["Grill", "Patty", "Stack", "Char", "Smash", "Iron", "Flame", "Coal"],
    nouns: ["Grill", "Stack", "Char", "Smoke", "Iron", "Flame"],
    characters: ["Jake", "Ruby", "Earl", "Betty", "Sam"],
    bold: ["EMBER", "STACK", "CHAR", "FLAME", "COAL"],
    evocative: [["Iron", "Fork"], ["Smoke", "Signal"], ["Golden", "Rule"], ["Fire", "Line"]],
  },
  asian: {
    food: ["Bamboo", "Lotus", "Umami", "Steam", "Wok", "Ramen", "Sakura", "Zen"],
    nouns: ["Steam", "Bowl", "Noodle", "Rice", "Soy", "Ginger"],
    characters: ["Lin", "Kenji", "Mei", "Hana", "Jin"],
    bold: ["UMAMI", "LOTUS", "ZEN", "SAKURA", "STEAM"],
    evocative: [["Golden", "Bowl"], ["Iron", "Wok"], ["Quiet", "Fire"], ["River", "Stone"]],
  },
  mediterranean: {
    food: ["Olive", "Harbor", "Aegean", "Sun", "Villa", "Cypress", "Flora", "Vale"],
    nouns: ["Olive", "Herb", "Sea", "Sun", "Grain", "Fire"],
    characters: ["Niko", "Sophia", "Elena", "Marco", "Leo"],
    bold: ["FLORA", "VALE", "AEGEAN", "OLIVE", "HERB"],
    evocative: [["Golden", "Harbor"], ["Salt", "Sun"], ["Blue", "Table"], ["Olive", "Branch"]],
  },
  bbq: {
    food: ["Smoke", "Pit", "Ember", "Oak", "Brisket", "Coal", "Hickory", "Ash"],
    nouns: ["Smoke", "Brisket", "Oak", "Ash", "Fire", "Rub"],
    characters: ["Earl", "Ray", "Bo", "Dixie", "Clay"],
    bold: ["SMOKE", "EMBER", "PIT", "OAK", "BRISKET"],
    evocative: [["Smoke", "Signal"], ["Salt", "Smoke"], ["Iron", "Pit"], ["Low", "Slow"]],
  },
  cafe: {
    food: ["Bean", "Roast", "Brew", "Daily", "Cup", "Morning", "Press", "Grind"],
    nouns: ["Bean", "Roast", "Cup", "Morning", "Steam", "Crema"],
    characters: ["Maya", "Theo", "Clara", "Finn", "June"],
    bold: ["ROAST", "BEAN", "CREMA", "PRESS", "DAILY"],
    evocative: [["Morning", "Ritual"], ["Golden", "Cup"], ["Quiet", "Corner"], ["First", "Pour"]],
  },
  bakery: {
    food: ["Crumb", "Flour", "Rise", "Whisk", "Oven", "Sugar", "Crust", "Proof"],
    nouns: ["Crumb", "Flour", "Crust", "Sugar", "Butter", "Rise"],
    characters: ["Marie", "Claire", "Pierre", "Ada", "Rose"],
    bold: ["CRUMB", "RISE", "CRUST", "FLOUR", "PROOF"],
    evocative: [["Golden", "Crust"], ["Sugar", "Stone"], ["Warm", "Oven"], ["Daily", "Loaf"]],
  },
  "fast-casual": {
    food: ["Bowl", "Fresh", "Green", "Grain", "Leaf", "Fuel", "Bright", "Quick"],
    nouns: ["Bowl", "Grain", "Green", "Fresh", "Fuel", "Leaf"],
    characters: ["Sam", "Alex", "Jordan", "Riley", "Casey"],
    bold: ["FRESH", "BOWL", "GREEN", "FUEL", "BRIGHT"],
    evocative: [["Fast", "Fresh"], ["Green", "Line"], ["Golden", "Bowl"], ["Daily", "Fuel"]],
  },
  "fine-dining": {
    food: ["Reserve", "Maison", "Table", "Noir", "Velvet", "Pearl", "Atlas", "Crown"],
    nouns: ["Reserve", "Pearl", "Velvet", "Cellar", "Plate", "Silk"],
    characters: ["Henri", "Vera", "August", "Claire", "Sterling"],
    bold: ["MAISON", "NOIR", "PEARL", "ATLAS", "RESERVE"],
    evocative: [["Golden", "Rule"], ["Iron", "Fork"], ["Quiet", "Room"], ["Silver", "Plate"]],
  },
  seafood: {
    food: ["Harbor", "Tide", "Catch", "Reef", "Anchor", "Net", "Bay", "Salt"],
    nouns: ["Tide", "Catch", "Salt", "Net", "Reef", "Bay"],
    characters: ["Captain", "Marina", "Finn", "Pearl", "Dock"],
    bold: ["TIDE", "REEF", "CATCH", "HARBOR", "SALT"],
    evocative: [["Salt", "Harbor"], ["Blue", "Catch"], ["Golden", "Net"], ["Deep", "Blue"]],
  },
  indian: {
    food: ["Masala", "Tandoor", "Spice", "Curry", "Saffron", "Naan", "Garam", "Dhaba"],
    nouns: ["Masala", "Spice", "Curry", "Naan", "Chai", "Tandoor"],
    characters: ["Priya", "Raj", "Anita", "Dev", "Amir"],
    bold: ["MASALA", "SAFFRON", "TANDOOR", "SPICE", "GARAM"],
    evocative: [["Golden", "Spice"], ["Fire", "Fold"], ["Warm", "Table"], ["Royal", "Road"]],
  },
  other: {
    food: ["Kitchen", "Table", "Gather", "Hearth", "Fork", "Plate", "Corner", "House"],
    nouns: ["Kitchen", "Table", "Plate", "Fork", "House", "Room"],
    characters: ["Sam", "Alex", "Jordan", "Taylor", "Jordan"],
    bold: ["HEARTH", "GATHER", "TABLE", "FORGE", "LORE"],
    evocative: [["Golden", "Rule"], ["Iron", "Fork"], ["Smoke", "Signal"], ["Open", "Table"]],
  },
};

const VIBE_ACTIONS: Record<string, string[]> = {
  "Bold & Modern": ["Fire", "Forge", "Bold", "Blaze", "Shift"],
  "Warm & Family": ["Gather", "Home", "Hearth", "Welcome", "Comfort"],
  "Upscale & Elegant": ["Reserve", "Pearl", "Velvet", "Maison", "Grand"],
  "Fun & Casual": ["Happy", "Lucky", "Playful", "Sunny", "Social"],
  "Local & Authentic": ["Neighbor", "Local", "Heritage", "Corner", "Native"],
  "Fast & Fresh": ["Fresh", "Quick", "Bright", "Daily", "Rapid"],
  "Rustic & Homemade": ["Rustic", "Farm", "Hearth", "Homestead", "Oak"],
  "Trendy & Social": ["Social", "Urban", "Collective", "Studio", "Room"],
};

const VIBE_TAGLINES: Record<string, string[]> = {
  "Bold & Modern": ["Bold flavors, modern energy.", "Where the city eats loud."],
  "Warm & Family": ["Come hungry, leave like family.", "Your neighborhood table."],
  "Upscale & Elegant": ["An evening worth dressing for.", "Refined plates, relaxed grace."],
  "Fun & Casual": ["Good food, good mood, always.", "The fun spot on the block."],
  "Local & Authentic": ["Tastes like where you live.", "Built for this neighborhood."],
  "Fast & Fresh": ["Fresh food, fast pace.", "Quality without the wait."],
  "Rustic & Homemade": ["Made slow, served with heart.", "Honest food, real ingredients."],
  "Trendy & Social": ["See and be seen over great food.", "The social table in town."],
};

const LANDMARK_HINTS: Record<string, string[]> = {
  houston: ["Bayou", "Heights", "Montrose", "River Oaks", "Midtown"],
  dallas: ["Deep Ellum", "Uptown", "Oak Cliff", "Trinity"],
  austin: ["South Congress", "East Side", "Hill Country", "Sixth Street"],
  chicago: ["Wicker Park", "River North", "Lakeview", "Loop"],
  miami: ["South Beach", "Coral", "Brickell", "Little Havana"],
  atlanta: ["Midtown", "Buckhead", "Decatur", "Peachtree"],
  default: ["Main Street", "Downtown", "Market", "Central"],
};

const CONCEPT_SUFFIXES = ["Kitchen", "Bowl", "Grill", "Table", "House", "Room", "Co.", "Eatery"];

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

function titleCase(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function parseWordPrefs(input: string): { love: string[]; hate: string[] } {
  const love = Array.from(input.matchAll(/love\s+['"]?(\w+)['"]?/gi), m => m[1]!.toLowerCase());
  const hate = Array.from(input.matchAll(/hate\s+['"]?(\w+)['"]?/gi), m => m[1]!.toLowerCase());
  return { love, hate };
}

export function parseLocationInput(city: string): {
  primary: string;
  neighborhood: string;
  cityToken: string;
} {
  const cleaned = city.trim();
  const main = cleaned.split(",")[0]?.trim() ?? cleaned;
  const parts = main.split(/\s+/).filter(Boolean);
  const neighborhood = parts.length > 1 ? titleCase(parts[parts.length - 1]!) : titleCase(main);
  const cityToken = parts.length > 1 ? titleCase(parts[0]!) : titleCase(main);
  return { primary: titleCase(main), neighborhood, cityToken };
}

function landmarkWords(city: string): string[] {
  const key = city.toLowerCase().split(",")[0]?.trim().split(/\s+/)[0] ?? "";
  return LANDMARK_HINTS[key] ?? LANDMARK_HINTS.default!;
}

function isBlockedName(name: string): boolean {
  const lower = name.toLowerCase();
  return CHAIN_BLOCKLIST.some(chain => lower.includes(chain));
}

function containsHated(name: string, hate: string[]): boolean {
  const lower = name.toLowerCase();
  return hate.some(word => lower.includes(word));
}

function buildTagline(rng: () => number, vibes: VibeKey[], city: string, name: string): string {
  const vibe = pick(rng, vibes.length ? vibes : ["Local & Authentic"]);
  const templates = VIBE_TAGLINES[vibe] ?? ["Great food, great name."];
  const base = pick(rng, templates);
  if (city.trim()) {
    return base.replace("the city", city.split(",")[0]!.trim()).replace("the block", city.split(",")[0]!.trim());
  }
  return `${base} Welcome to ${name}.`.replace("Welcome to .", "");
}

export interface NameGeneratorInput {
  cuisine: string;
  customCuisine?: string;
  city: string;
  vibes: VibeKey[];
  wordPrefs?: string;
}

export interface GeneratedName {
  name: string;
  tagline: string;
  slug: string;
}

export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

export function generateRestaurantNames(input: NameGeneratorInput): GeneratedName[] {
  const bankKey = input.cuisine === "other" && input.customCuisine?.trim()
    ? "other"
    : input.cuisine;
  const bank = CUISINE_BANKS[bankKey] ?? CUISINE_BANKS.other!;
  const location = parseLocationInput(input.city);
  const landmarks = landmarkWords(input.city);
  const { love, hate } = parseWordPrefs(input.wordPrefs ?? "");
  const vibes = input.vibes.length ? input.vibes : (["Local & Authentic"] as VibeKey[]);
  const actions = vibes.flatMap(v => VIBE_ACTIONS[v] ?? []);
  const rng = createRng(
    hashSeed(`${input.cuisine}|${input.customCuisine ?? ""}|${input.city}|${vibes.join(",")}|${input.wordPrefs ?? ""}`)
  );

  const loveWord = love[0] ? titleCase(love[0]) : null;
  const place = location.neighborhood || location.cityToken || "Main";
  const character = pick(rng, bank.characters);
  const results: GeneratedName[] = [];
  const seen = new Set<string>();

  const candidates: string[] = [
    `${place} ${pick(rng, bank.food)}`,
    `${pick(rng, actions.length ? actions : bank.nouns)} & ${pick(rng, bank.nouns)}`,
    `${character}'s Table`,
    pick(rng, bank.bold),
    `${place} ${pick(rng, CONCEPT_SUFFIXES)}`,
    (() => {
      const pair = pick(rng, bank.evocative);
      return `${pair[0]} ${pair[1]}`;
    })(),
    `${pick(rng, landmarks)} ${pick(rng, ["Bites", "Table", "Kitchen", "Eats", "Room"])}`,
    `The ${pick(rng, ["Neighbor's", "Cook's", "Local's", "Founder's"])} ${pick(rng, ["Table", "Corner", "Kitchen", "Room"])}`,
  ];

  if (loveWord) {
    candidates.push(`${place} ${loveWord}`, `${loveWord} & ${pick(rng, bank.nouns)}`);
  }
  if (input.customCuisine?.trim()) {
    candidates.push(`${place} ${titleCase(input.customCuisine.trim())}`);
  }

  for (const raw of candidates) {
    const name = raw.replace(/\s+/g, " ").trim();
    const slug = nameToSlug(name);
    if (!name || !slug || seen.has(name.toLowerCase()) || isBlockedName(name) || containsHated(name, hate)) {
      continue;
    }
    seen.add(name.toLowerCase());
    results.push({
      name,
      tagline: buildTagline(rng, vibes, input.city, name),
      slug,
    });
    if (results.length >= 8) break;
  }

  let guard = 0;
  while (results.length < 8 && guard < 40) {
    guard += 1;
    const fallback = `${place} ${pick(rng, bank.food)} ${results.length + 1}`;
    const name = fallback.trim();
    const slug = nameToSlug(name);
    if (!slug || seen.has(name.toLowerCase()) || isBlockedName(name)) continue;
    seen.add(name.toLowerCase());
    results.push({ name, tagline: buildTagline(rng, vibes, input.city, name), slug });
  }

  return results.slice(0, 8);
}

export type DomainStatus = "available" | "taken" | "unknown";

export async function checkDomainAvailability(slug: string): Promise<DomainStatus> {
  if (!slug) return "unknown";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(
      `https://api.domainsdb.info/v1/domains/search?domain=${encodeURIComponent(slug)}&zone=com`,
      { signal: controller.signal }
    );
    if (!res.ok) return "unknown";
    const data = (await res.json()) as { domains?: Array<{ domain?: string }> };
    const domains = data.domains ?? [];
    const taken = domains.some(d => d.domain?.toLowerCase().startsWith(`${slug.toLowerCase()}.`));
    return taken ? "taken" : "available";
  } catch {
    return "unknown";
  } finally {
    clearTimeout(timeout);
  }
}

export function namecheapSearchUrl(slug: string): string {
  return `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(slug)}`;
}

export const SAVED_NAME_STORAGE_KEY = "rsf_saved_restaurant_name";
