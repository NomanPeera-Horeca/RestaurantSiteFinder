import { useId } from "react";

type FeaturedImageBadge = {
  type: "image";
  href: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  rel?: string;
  title?: string;
};

type FeaturedTextLink = {
  type: "text";
  href: string;
  label: string;
  title?: string;
};

type FeaturedTinyStartupsBadge = {
  type: "tiny-startups";
  href: string;
  rel?: string;
};

type FeaturedItem = FeaturedImageBadge | FeaturedTextLink | FeaturedTinyStartupsBadge;

const FEATURED_ITEMS: FeaturedItem[] = [
  {
    type: "image",
    href: "https://submitaitools.org",
    src: "https://submitaitools.org/static_submitaitools/images/submitaitools.png",
    alt: "Submit AI Tools",
    width: 200,
    height: 60,
  },
  {
    type: "image",
    href: "https://findly.tools/restaurant-site-finder?utm_source=restaurant-site-finder",
    src: "https://findly.tools/badges/findly-tools-badge-light.svg",
    alt: "Featured on Findly.tools",
    width: 175,
    height: 55,
  },
  {
    type: "text",
    href: "https://www.aitoolzdir.com",
    label: "AI Toolz Dir",
  },
  {
    type: "image",
    href: "https://fazier.com",
    src: "https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=light",
    alt: "Fazier badge",
    width: 120,
    height: 40,
  },
  {
    type: "image",
    href: "https://turbo0.com/item/restaurant-site-finder",
    src: "https://img.turbo0.com/badge-listed-light.svg",
    alt: "Listed on Turbo0",
    width: 175,
    height: 54,
  },
  {
    type: "image",
    href: "https://wired.business",
    src: "https://wired.business/badge0-white.svg",
    alt: "Featured on Wired Business",
    width: 200,
    height: 54,
  },
  {
    type: "image",
    href: "https://open-launch.com/projects/restaurant-site-finder",
    src: "https://open-launch.com/api/badge/7193c6a8-bb4f-4668-af13-da78d0d7a545/featured-light.svg",
    alt: "Featured on Open-Launch",
    width: 200,
    height: 50,
  },
  {
    type: "image",
    href: "https://www.superlaun.ch/products/2795",
    src: "https://www.superlaun.ch/badge.png",
    alt: "Featured on Super Launch",
    width: 300,
    height: 300,
  },
  {
    type: "text",
    href: "https://www.voomo.ai/",
    label: "AI Corporate Video Maker",
  },
  {
    type: "image",
    href: "https://backlinkhubs.com/?utm_source=badge&utm_medium=embed&utm_campaign=restaurantsitefinder-com",
    src: "https://backlinkhubs.com/badge.svg?theme=light&label=Listed%20on%20Backlinkhubs",
    alt: "Listed on Backlinkhubs",
    width: 200,
    height: 54,
  },
  {
    type: "image",
    href: "https://marketingdb.live",
    src: "https://marketingdb.live/badge.svg",
    alt: "Listed on MarketingDB",
    width: 190,
    height: 44,
    rel: "noopener noreferrer nofollow sponsored",
  },
  {
    type: "text",
    href: "https://z-image.net/",
    label: "Z-Image",
  },
  {
    type: "image",
    href: "https://dang.ai",
    src: "https://assets.dang.ai/badges/dang-verified-dark.png",
    alt: "Verified on DANG!",
    width: 260,
    height: 94,
    rel: "dofollow noopener",
  },
  {
    type: "text",
    href: "https://aitooltrek.com",
    label: "AI Tool Trek",
    title: "AI Tool Trek",
  },
  {
    type: "image",
    href: "https://www.launchvault.dev",
    src: "https://www.launchvault.dev/images/badges/launch-valut-badge.svg",
    alt: "Featured on LaunchVault",
    width: 195,
    height: 54,
    title: "Featured on LaunchVault",
  },
  {
    type: "image",
    href: "https://huzzler.so/products/7xDqGxdOvl/restaurant-site-finder?utm_source=huzzler_product_website&utm_medium=badge&utm_campaign=free_listing",
    src: "https://huzzler.so/assets/images/embeddable-badges/featured.png",
    alt: "Huzzler Embed Badge",
    width: 159,
    height: 55,
  },
  {
    type: "image",
    href: "https://launchboard.dev",
    src: "https://launchboard.dev/launchboard-badge.png",
    alt: "Launched on LaunchBoard - Product Launch Platform",
    width: 240,
    height: 60,
    rel: "noopener",
  },
  {
    type: "image",
    href: "https://www.foundrlist.com/product/restaurantsitefinder?utm_source=badge&utm_medium=embed",
    src: "https://www.foundrlist.com/api/badge/restaurantsitefinder",
    alt: "Featured on FoundrList",
    width: 150,
    height: 48,
    rel: "noopener",
  },
  {
    type: "image",
    href: "https://trylaunch.ai/launch/restaurant-site-finder",
    src: "https://trylaunch.ai/badges/badge-color.png",
    alt: "Featured on Launch",
    width: 175,
    height: 53,
    rel: "dofollow",
  },
  {
    type: "image",
    href: "https://proofstories.io/directory/products/restaurant-site-finder/",
    src: "https://proofstories.io/directory/badges/l/restaurant-site-finder.svg",
    alt: "Listed on ProofStories",
    width: 175,
    height: 44,
    rel: "noopener",
  },
  {
    type: "image",
    href: "https://saaspa.ge/product/cmrc3d7r5000bjr04deu8y1n5",
    src: "https://saaspa.ge/api/embed/product/cmrc3d7r5000bjr04deu8y1n5/badge.png?theme=orange",
    alt: "Featured on Saaspa.ge",
    width: 200,
    height: 60,
    rel: "nofollow",
  },
  {
    type: "image",
    href: "https://indiehunt.io/project/restaurant-site-finder-by-horeca-store",
    src: "https://indiehunt.io/badges/indiehunt-badge-light.svg",
    alt: "Featured on IndieHunt",
    width: 265,
    height: 58,
    rel: "noopener",
  },
  {
    type: "image",
    href: "https://www.freewebsubmission.com",
    src: "https://www.freewebsubmission.com/images/fwsbutton11.gif",
    alt: "Submit Your Site To The Web's Top 50 Search Engines for Free!",
    width: 88,
    height: 31,
  },
  {
    type: "tiny-startups",
    href: "https://www.tinystartups.com/startup/restaurant-site-finder-2",
    rel: "noopener",
  },
  {
    type: "text",
    href: "https://aitop10.tools/",
    label: "AiTop10 Tools",
  },
  {
    type: "text",
    href: "https://indieai.directory/",
    label: "Listed on IndieAI Directory",
  },
  {
    type: "image",
    href: "https://dayslaunch.com",
    src: "https://dayslaunch.com/badages-awards.svg",
    alt: "Featured on Days Launch",
    width: 175,
    height: 54,
    rel: "noopener noreferrer",
  },
  {
    type: "image",
    href: "https://starterbest.com",
    src: "https://starterbest.com/badages-awards.svg",
    alt: "Featured on Starter Best",
    width: 175,
    height: 54,
    rel: "noopener noreferrer",
  },
  {
    type: "image",
    href: "https://theonestartup.com",
    src: "https://theonestartup.com/badages-awards.svg",
    alt: "Featured on The One Startup",
    width: 175,
    height: 54,
    rel: "noopener noreferrer",
  },
  {
    type: "image",
    href: "https://saasfame.com/item/restaurant-site-finder",
    src: "https://saasfame.com/badge-light.svg",
    alt: "Featured on saasfame.com",
    width: 175,
    height: 54,
    rel: "noopener noreferrer",
  },
  {
    type: "image",
    href: "https://goodaitools.com/ai/restaurantsitefinder",
    src: "https://goodaitools.com/assets/images/badge-dark.png",
    alt: "Good AI Tools",
    width: 175,
    height: 54,
  },
  {
    type: "image",
    href: "https://drchecker.net/item/restaurantsitefinder.com",
    src: "https://drchecker.net/api/badge?domain=restaurantsitefinder.com",
    alt: "DR Checker - Domain Rating",
    width: 200,
    height: 120,
  },
  {
    type: "image",
    href: "https://dofollow.tools",
    src: "https://dofollow.tools/badge/badge_transparent.svg",
    alt: "Featured on Dofollow.Tools",
    width: 200,
    height: 54,
  },
  {
    type: "image",
    href: "https://similarlabs.com",
    src: "https://similarlabs.com/similarlabs-embed-badge-light.svg",
    alt: "List on Similarlabs",
    width: 124,
    height: 40,
  },
  {
    type: "text",
    href: "https://animatephoto.io",
    label: "Animate Photo AI",
  },
  {
    type: "image",
    href: "https://submithunt.com",
    src: "https://submithunt.com/badge-light.svg",
    alt: "Featured on Submit Hunt",
    width: 240,
    height: 66,
  },
  {
    type: "image",
    href: "https://earlyhunt.com/project/restaurant-site-finder",
    src: "https://earlyhunt.com/badges/earlyhunt-badge-light.svg",
    alt: "Featured on EarlyHunt",
    width: 265,
    height: 58,
    rel: "noopener",
  },
];

function TinyStartupsBadge({ href, rel }: { href: string; rel?: string }) {
  const gradientId = useId().replace(/:/g, "");

  return (
    <a
      href={href}
      target="_blank"
      rel={rel ?? "noopener noreferrer"}
      title="Launched on Tiny Startups"
      className="featured-at-tiny-startups"
      aria-label="Launched on Tiny Startups"
    >
      <svg width="32" height="32" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1=".1" y1="0" x2=".9" y2="1">
            <stop offset="0%" stopColor="#3525E6" />
            <stop offset="55%" stopColor="#D81FE0" />
            <stop offset="100%" stopColor="#22B8F0" />
          </linearGradient>
        </defs>
        <path
          d="M50 6C52 32 68 48 94 50C68 52 52 68 50 94C48 68 32 52 6 50C32 48 48 32 50 6Z"
          fill={`url(#${gradientId})`}
        />
      </svg>
      <span className="featured-at-tiny-startups-copy">
        <span className="featured-at-tiny-startups-eyebrow">Launched on</span>
        <span className="featured-at-tiny-startups-name">Tiny Startups</span>
      </span>
    </a>
  );
}

function FeaturedItemContent({ item }: { item: FeaturedItem }) {
  if (item.type === "image") {
    return (
      <a href={item.href} target="_blank" rel={item.rel ?? "noopener noreferrer"} title={item.title}>
        <img
          src={item.src}
          alt={item.alt}
          width={item.width}
          height={item.height}
          loading="lazy"
        />
      </a>
    );
  }

  if (item.type === "tiny-startups") {
    return <TinyStartupsBadge href={item.href} rel={item.rel} />;
  }

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      title={item.title}
      className="featured-at-link text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
    >
      {item.label}
    </a>
  );
}

function FeaturedAtMarqueeSet({ items, ariaHidden }: { items: FeaturedItem[]; ariaHidden?: boolean }) {
  return (
    <div className="featured-at-marquee-set" aria-hidden={ariaHidden}>
      {items.map((item, index) => (
        <span key={`${item.href}-${index}`} className="inline-flex shrink-0 items-center gap-3">
          {index > 0 && (
            <span className="text-muted-foreground/40 select-none" aria-hidden="true">
              ·
            </span>
          )}
          <FeaturedItemContent item={item} />
        </span>
      ))}
    </div>
  );
}

export function FeaturedAtSection() {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <p className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
        Featured At
      </p>
      <div className="featured-at-marquee">
        <div className="featured-at-marquee-track">
          <FeaturedAtMarqueeSet items={FEATURED_ITEMS} />
          <FeaturedAtMarqueeSet items={FEATURED_ITEMS} ariaHidden />
        </div>
      </div>
    </div>
  );
}
