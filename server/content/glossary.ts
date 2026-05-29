import fs from "fs";
import { GLOSSARY_FILE } from "./paths";
import type { GlossaryData, GlossaryTerm } from "./types";

let cache: GlossaryData | null = null;

export function loadGlossary(): GlossaryData {
  if (cache) return cache;
  const raw = fs.readFileSync(GLOSSARY_FILE, "utf-8");
  cache = JSON.parse(raw) as GlossaryData;
  return cache;
}

export function getAllGlossaryTerms(): GlossaryTerm[] {
  return loadGlossary().terms.sort((a, b) => a.term.localeCompare(b.term));
}

export function getGlossaryTerm(slug: string): GlossaryTerm | null {
  return getAllGlossaryTerms().find(t => t.slug === slug) ?? null;
}

export function getAllGlossarySlugs(): string[] {
  return getAllGlossaryTerms().map(t => t.slug);
}

export function getGlossaryByCategory(): Record<string, GlossaryTerm[]> {
  const grouped: Record<string, GlossaryTerm[]> = {};
  for (const term of getAllGlossaryTerms()) {
    if (!grouped[term.category]) grouped[term.category] = [];
    grouped[term.category].push(term);
  }
  return grouped;
}

export function clearGlossaryCache(): void {
  cache = null;
}
