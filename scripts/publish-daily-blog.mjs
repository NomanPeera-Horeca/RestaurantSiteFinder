#!/usr/bin/env node
/**
 * Publish the next queued blog post (one per day).
 *
 * Usage:
 *   node scripts/publish-daily-blog.mjs           # publish next if not done today
 *   node scripts/publish-daily-blog.mjs --force   # ignore today's guard
 *   node scripts/publish-daily-blog.mjs --dry-run   # generate only, no writes
 *   node scripts/publish-daily-blog.mjs --slug=x   # publish specific queue item
 *
 * Requires: OPENAI_API_KEY
 * Optional: OPENAI_MODEL (default gpt-4o), BLOG_AUTOMATION_ENABLED=false to skip
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildGenerationPrompt } from "./lib/blog-prompt.mjs";
import { validatePost, postProcess } from "./lib/blog-validator.mjs";
import {
  listExistingSlugs,
  updateLlmsTxt,
  crossLinkRelated,
} from "./lib/blog-side-effects.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "content/blog");
const CALENDAR_DIR = path.join(ROOT, "content/calendar");
const QUEUE_FILE = path.join(CALENDAR_DIR, "queue.json");
const STATE_FILE = path.join(CALENDAR_DIR, "state.json");
const LLMS_FILE = path.join(ROOT, "content/llms.txt");

const args = process.argv.slice(2);
const force = args.includes("--force");
const dryRun = args.includes("--dry-run");
const slugArg = args.find(a => a.startsWith("--slug="))?.split("=")[1];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function saveState(state) {
  if (dryRun) return;
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + "\n");
}

async function generateWithOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing. Add it in GitHub → Settings → Secrets and variables → Actions → New repository secret (name must be exactly OPENAI_API_KEY)."
    );
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      max_tokens: 12000,
      messages: [
        {
          role: "system",
          content:
            "You write SEO/GEO-optimized restaurant industry guides. Output only valid markdown with YAML frontmatter. Never wrap output in code fences.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    let hint = "";
    if (res.status === 401) {
      hint = " Key is invalid or revoked — create a new key at platform.openai.com/api-keys and update the OPENAI_API_KEY GitHub secret.";
    } else if (res.status === 429) {
      hint = " Rate limit or billing issue — check OpenAI account credits.";
    }
    throw new Error(`OpenAI API error ${res.status}: ${err.slice(0, 500)}.${hint}`);
  }

  const data = await res.json();
  let text = data.choices?.[0]?.message?.content ?? "";
  text = text.replace(/^```(?:markdown|md)?\n/i, "").replace(/\n```$/i, "").trim();
  if (!text.startsWith("---")) {
    throw new Error("Model did not return frontmatter markdown");
  }
  return text;
}

function pickNextPost(queue, state, existingSlugs) {
  if (slugArg) {
    const spec = queue.posts.find(p => p.slug === slugArg);
    if (!spec) throw new Error(`Slug not in queue: ${slugArg}`);
    return spec;
  }

  for (let i = state.nextIndex; i < queue.posts.length; i++) {
    const spec = queue.posts[i];
    if (existingSlugs.includes(spec.slug)) {
      continue;
    }
    if (state.published.includes(spec.slug)) {
      continue;
    }
    return { spec, index: i };
  }

  return null;
}

async function main() {
  if (process.env.BLOG_AUTOMATION_ENABLED === "false") {
    console.log("BLOG_AUTOMATION_ENABLED=false — skipping");
    return;
  }

  const queue = loadJson(QUEUE_FILE);
  const state = loadJson(STATE_FILE);
  const existingSlugs = listExistingSlugs(BLOG_DIR);
  const today = todayIso();

  if (!force && state.lastPublishedDate === today) {
    console.log(`Already published today (${today}). Use --force to override.`);
    return;
  }

  const picked = pickNextPost(queue, state, existingSlugs);
  if (!picked) {
    console.log("Queue exhausted. Add more posts to content/calendar/queue.json");
    process.exit(0);
  }

  const spec = picked.spec ?? picked;
  const index = picked.index ?? queue.posts.findIndex(p => p.slug === spec.slug);

  const outPath = path.join(BLOG_DIR, `${spec.slug}.md`);
  if (existingSlugs.includes(spec.slug) && !slugArg) {
    console.log(`Skipping ${spec.slug} — file already exists`);
    state.nextIndex = index + 1;
    if (!state.published.includes(spec.slug)) state.published.push(spec.slug);
    saveState(state);
    return;
  }

  console.log(`Generating: ${spec.title} (${spec.slug})`);

  let raw = "";
  let errors = [];
  let wordCount = 0;
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let prompt = buildGenerationPrompt(spec, existingSlugs);
    if (attempt > 1) {
      prompt += `\n\n## FIX REQUIRED (attempt ${attempt}/${maxAttempts})\nPrevious output failed validation:\n${errors.map(e => `- ${e}`).join("\n")}\n\nOutput a COMPLETE corrected markdown file fixing every issue. Keep slug exactly "${spec.slug}". metaDescription MUST be under 155 characters. Body MUST be at least 900 words with 5+ H2 sections and a tldr-box div.`;
    }

    console.log(`OpenAI attempt ${attempt}/${maxAttempts}...`);
    raw = await generateWithOpenAI(prompt);
    raw = postProcess(raw, spec);

    ({ errors, wordCount } = validatePost(raw, spec.slug));
    if (!errors.length) break;

    console.warn("Validation issues:", errors.join("; "));
    if (attempt === maxAttempts) {
      console.error("Validation failed after", maxAttempts, "attempts:");
      errors.forEach(e => console.error(" -", e));
      process.exit(1);
    }
  }

  console.log(`Validated: ${wordCount} words, meta OK`);

  if (dryRun) {
    console.log(raw.slice(0, 800) + "\n...\n");
    return;
  }

  fs.writeFileSync(outPath, raw);

  const llms = updateLlmsTxt(LLMS_FILE, spec);
  fs.writeFileSync(LLMS_FILE, llms);

  const linked = crossLinkRelated(BLOG_DIR, spec);
  if (linked.length) console.log("Cross-linked from:", linked.join(", "));

  state.nextIndex = index + 1;
  if (!state.published.includes(spec.slug)) state.published.push(spec.slug);
  state.lastPublishedDate = today;
  saveState(state);

  console.log(`Published ${spec.slug} → ${outPath}`);
  console.log(`Queue progress: ${state.published.length}/${queue.posts.length}`);
}

main().catch(err => {
  console.error(err.message ?? err);
  process.exit(1);
});
