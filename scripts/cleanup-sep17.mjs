import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, s) => fs.writeFileSync(path.join(root, p), s);

function replaceOnce(text, from, to, label) {
  if (!text.includes(from)) throw new Error(`Missing expected text for ${label}`);
  return text.replace(from, to);
}

function replaceFrontMatterList(text, key, items) {
  const re = new RegExp(`(^${key}:\\n)(?:  - .*\\n)+`, 'm');
  if (!re.test(text)) throw new Error(`Missing front matter list: ${key}`);
  return text.replace(re, `$1${items.map(v => `  - ${v}\n`).join('')}`);
}

function updateFile(file, fn) {
  const before = read(file);
  const after = fn(before);
  if (before === after) throw new Error(`No changes made to ${file}`);
  write(file, after);
  console.log(`updated ${file}`);
}

updateFile('content/blog/restaurant-rent-how-much-should-you-pay.md', text =>
  replaceOnce(
    text,
    'metaDescription: "Determine the ideal restaurant rent with our guide, covering costs, lease terms, and location impacts. Master commercial rent and optimize food."',
    'metaDescription: "Learn how much restaurant rent you can afford using sales, occupancy costs, lease terms, buildout risk, and conservative cash-flow tests before signing."',
    'rent meta description'
  )
);

updateFile('content/blog/how-to-choose-restaurant-location-based-on-foot-traffic.md', text =>
  replaceOnce(
    text,
    'metaDescription: "Discover how to choose a restaurant location based on foot traffic to boost visibility and customer flow. Learn effective location strategies for."',
    'metaDescription: "Choose a restaurant location using foot traffic quality, customer intent, visibility, access, dayparts, and real-world observation before signing a lease."',
    'foot traffic meta description'
  )
);

updateFile('content/blog/restaurant-location-analysis-15-factors-signing-lease.md', text => {
  text = replaceOnce(text,
    'title: "Restaurant Location Analysis: 15 Factors to Check Before Signing a Lease"',
    'title: "Restaurant Lease Due Diligence: 15 Site Checks Before You Sign"',
    'lease title');
  text = replaceOnce(text,
    'metaTitle: "Restaurant Location Checklist: 15 Key Factors Before Leasing"',
    'metaTitle: "Restaurant Lease Due Diligence: 15 Site Checks"',
    'lease meta title');
  text = replaceOnce(text,
    'metaDescription: "Discover 15 key factors for successful restaurant location analysis before signing a lease. Enhance your location strategy with our comprehensive."',
    'metaDescription: "Use a restaurant lease due diligence checklist covering demand, access, parking, competition, buildout, zoning, labor, and occupancy costs before signing."',
    'lease meta description');
  text = replaceFrontMatterList(text, 'tags', [
    'restaurant lease due diligence',
    'restaurant site due diligence',
    'lease signing',
    'restaurant property inspection',
    'site selection',
  ]);
  text = replaceOnce(text,
    'excerpt: "Restaurant location analysis, 15 factors to check before signing a lease: concept fit, demographics, daypart demand, visibility, access, parking, foot traffic, competition, lease economics, buildout, labor, regulations, operating costs, site comparison, and red flags."',
    'excerpt: "Restaurant lease due diligence, 15 checks covering concept fit, demographics, dayparts, access, parking, competition, economics, buildout, labor, zoning, and site-level operating costs."',
    'lease excerpt');
  text = replaceFrontMatterList(text, 'keywords', [
    'restaurant lease due diligence',
    'restaurant lease due diligence checklist',
    'restaurant site due diligence',
    'what to check before signing restaurant lease',
    'restaurant property inspection checklist',
  ]);
  text = replaceOnce(text,
    'question: "What should restaurant location analysis tell you before signing a lease?"',
    'question: "What should restaurant lease due diligence tell you before signing?"',
    'lease faq 1');
  text = replaceOnce(text,
    'question: "What are the 15 factors to check before signing a restaurant lease?"',
    'question: "What are the 15 restaurant site due diligence checks?"',
    'lease faq 2');
  text = replaceOnce(text,
    '<li><strong>Restaurant location analysis</strong> before signing a lease should confirm the site can support sales, service model, labor, delivery, and rent, not just look busy on a tour.</li>',
    '<li><strong>Restaurant lease due diligence</strong> should confirm the site can support sales, service model, labor, delivery, and rent, not just look busy on a tour.</li>',
    'lease takeaway');
  text = replaceOnce(text,
    'Restaurant location analysis helps you evaluate demand, access, competition, operating costs, and customer fit before you commit.',
    'Restaurant lease due diligence helps you evaluate demand, access, competition, operating costs, physical constraints, and customer fit before you commit.',
    'lease intro');
  text = replaceOnce(text,
    '## What should restaurant location analysis tell you before you sign?',
    '## What should restaurant lease due diligence tell you before you sign?',
    'lease h2');
  text = replaceOnce(text,
    'Restaurant location analysis should tell you whether a specific site can realistically support your sales, service model, labor needs, delivery radius, and rent burden.',
    'Restaurant lease due diligence should tell you whether a specific site can realistically support your sales, service model, labor needs, delivery radius, buildout requirements, and rent burden.',
    'lease h2 intro');
  text = replaceOnce(text,
    'The best restaurant location analysis combines field observation with data.',
    'The strongest lease due diligence combines field observation with data.',
    'lease positioning');
  return text;
});

updateFile('content/blog/restaurant-demographic-analysis-find-target-customers.md', text => {
  text = replaceOnce(text,
    'title: "Restaurant Demographic Analysis: How to Find Your Target Customers"',
    'title: "Restaurant Customer Demographics: How to Find Your Target Customers"',
    'demographic title');
  text = replaceOnce(text,
    'metaTitle: "Optimize Restaurant Demographics: Target Customers Guide"',
    'metaTitle: "Restaurant Customer Demographics: Find Your Target Audience"',
    'demographic meta title');
  text = replaceOnce(text,
    'metaDescription: "Unlock insights with restaurant demographic analysis to identify target customers and enhance menus, marketing, and experiences using data-driven."',
    'metaDescription: "Learn how to identify restaurant target customers using POS data, guest behavior, local demographics, segmentation, surveys, and market research."',
    'demographic meta description');
  text = replaceFrontMatterList(text, 'tags', [
    'restaurant customer demographics',
    'target customers',
    'market segmentation',
    'restaurant analytics',
    'customer research',
  ]);
  text = replaceOnce(text,
    'excerpt: "Restaurant demographic analysis, how to find your target customers using internal data, local market research, customer segments, surveys, menu and marketing alignment, tools, common mistakes, and ongoing analysis rhythm."',
    'excerpt: "Restaurant customer demographics, how to identify target customers using POS and reservation data, guest behavior, local market research, segmentation, surveys, and ongoing analysis."',
    'demographic excerpt');
  text = replaceFrontMatterList(text, 'keywords', [
    'restaurant customer demographics',
    'restaurant target customers',
    'restaurant customer segments',
    'restaurant target audience',
    'restaurant customer research',
  ]);
  text = replaceOnce(text,
    'question: "What is restaurant demographic analysis?"',
    'question: "What are restaurant customer demographics?"',
    'demographic faq');
  text = replaceOnce(text,
    '<li><strong>Restaurant demographic analysis</strong> helps you understand who your guests are, what they value, and why they choose you, beyond guessing at age or income alone.</li>',
    '<li><strong>Restaurant customer demographics</strong> help you understand who your guests are, what they value, and why they choose you, beyond guessing at age or income alone.</li>',
    'demographic takeaway');
  text = replaceOnce(text,
    'Restaurant demographic analysis helps you understand who your guests are, what they value, how often they dine out, and why they choose one place over another.',
    'Restaurant customer demographic analysis helps you understand who your guests are, what they value, how often they dine out, and why they choose one place over another.',
    'demographic intro');
  text = replaceOnce(text,
    'Food-away-from-home accounted for 56.3 percent of total U.S. food expenditures in 2025, according to USDA Economic Research Service data, which means restaurants are competing for a large but highly selective share of consumer spending.',
    'Food-away-from-home accounted for 56.3 percent of total U.S. food expenditures in 2025, according to [USDA Economic Research Service](https://www.ers.usda.gov/data-products/charts-of-note/114212), which means restaurants are competing for a large but highly selective share of consumer spending.',
    'USDA source');
  text = replaceOnce(text,
    '## What is restaurant demographic analysis?',
    '## What is restaurant customer demographic analysis?',
    'demographic h2');
  text = replaceOnce(text,
    'Restaurant demographic analysis is the process of studying the customer demographics, behaviors, and spending patterns of the people most likely to visit your restaurant.',
    'Restaurant customer demographic analysis is the process of studying the demographics, behaviors, and spending patterns of the people most likely to visit your restaurant.',
    'demographic definition');
  text = replaceOnce(text,
    "The National Restaurant Association's 2026 State of the Restaurant Industry report describes an environment where consumer resilience is being tested and value offerings and loyalty programs play an important role.",
    "The [National Restaurant Association's 2026 State of the Restaurant Industry report](https://restaurant.org/research-and-media/research/research-reports/state-of-the-industry) describes an environment where consumer resilience is being tested and value remains an important operating priority.",
    'NRA 2026 source');
  return text;
});

updateFile('content/blog/what-percentage-sales-should-rent-be-restaurant.md', text => {
  text = replaceOnce(text,
    'The Counselors of Real Estate notes the common industry rule that rent should generally be no more than 6% of total sales, with total occupancy cost no more than 10%.',
    '[The Counselors of Real Estate](https://cre.org/real-estate-issues/the-stages-in-the-life-of-a-restaurant-property/) notes the common industry rule of thumb that rent should generally be no more than 6% of total sales, with total occupancy cost no more than 10%.',
    'CRE source');
  text = replaceOnce(text,
    'The National Restaurant Association reported that restaurant occupancy costs were more than 5% of sales in 2024, with differences by restaurant type and location.',
    'The [National Restaurant Association](https://restaurant.org/research-and-media/research/restaurant-economic-insights/analysis-commentary/restaurant-occupancy-costs-were-more-than-5-of-sales-in-2024/) reported median occupancy costs of 5.7% of sales for full-service respondents and 5.2% for limited-service respondents in 2024, with meaningful variation by location.',
    'NRA occupancy source');
  return text;
});

const targetFiles = [
  'content/blog/what-percentage-sales-should-rent-be-restaurant.md',
  'content/blog/restaurant-rent-how-much-should-you-pay.md',
  'content/blog/how-to-choose-restaurant-location-based-on-foot-traffic.md',
  'content/blog/restaurant-location-analysis-15-factors-signing-lease.md',
  'content/blog/restaurant-demographic-analysis-find-target-customers.md',
];

function frontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error('Missing front matter');
  return m[1];
}

for (const file of targetFiles) {
  const text = read(file);
  const fm = frontMatter(text);
  const meta = fm.match(/^metaDescription: "([^"]+)"$/m)?.[1];
  if (!meta || meta.length < 110 || meta.length > 170) {
    throw new Error(`${file}: meta description length ${meta?.length ?? 0} is outside 110-170`);
  }

  for (const match of text.matchAll(/\]\(\/blog\/([a-z0-9-]+)\)/g)) {
    const slug = match[1];
    const dest = path.join(root, 'content/blog', `${slug}.md`);
    if (!fs.existsSync(dest)) throw new Error(`${file}: broken internal blog link /blog/${slug}`);
  }

  for (const match of text.matchAll(/!\[[^\]]*\]\(\/blog\/([a-z0-9-]+)\/([^\)]+)\)/g)) {
    const [, slug, image] = match;
    const dest = path.join(root, 'client/public/blog', slug, image);
    if (!fs.existsSync(dest)) throw new Error(`${file}: missing image /blog/${slug}/${image}`);
  }
}

const titles = new Map();
for (const name of fs.readdirSync(path.join(root, 'content/blog')).filter(f => f.endsWith('.md') && f !== '_TEMPLATE.md')) {
  const text = read(path.join('content/blog', name));
  const fm = frontMatter(text);
  const title = fm.match(/^metaTitle: "([^"]+)"$/m)?.[1]?.toLowerCase();
  if (!title) continue;
  if (titles.has(title)) throw new Error(`Duplicate metaTitle: ${title} in ${titles.get(title)} and ${name}`);
  titles.set(title, name);
}

console.log('content cleanup and verification passed');
