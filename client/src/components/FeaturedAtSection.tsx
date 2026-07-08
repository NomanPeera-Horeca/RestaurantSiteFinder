type FeaturedImageBadge = {
  type: "image";
  href: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
};

type FeaturedTextLink = {
  type: "text";
  href: string;
  label: string;
};

type FeaturedItem = FeaturedImageBadge | FeaturedTextLink;

const FEATURED_ITEMS: FeaturedItem[] = [
  {
    type: "image",
    href: "https://submitaitools.org",
    src: "https://submitaitools.org/static_submitaitools/images/submitaitools.png",
    alt: "Submit AI Tools",
    width: 200,
    height: 60,
    className: "rounded-[10px] w-[200px] h-[60px] object-contain",
  },
  {
    type: "image",
    href: "https://findly.tools/restaurant-site-finder?utm_source=restaurant-site-finder",
    src: "https://findly.tools/badges/findly-tools-badge-light.svg",
    alt: "Featured on Findly.tools",
    width: 175,
    height: 55,
    className: "w-[175px] h-[55px] object-contain",
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
    className: "w-[120px] h-auto object-contain",
  },
  {
    type: "image",
    href: "https://turbo0.com/item/restaurant-site-finder",
    src: "https://img.turbo0.com/badge-listed-light.svg",
    alt: "Listed on Turbo0",
    width: 175,
    height: 54,
    className: "h-[54px] w-auto object-contain",
  },
  {
    type: "image",
    href: "https://wired.business",
    src: "https://wired.business/badge0-white.svg",
    alt: "Featured on Wired Business",
    width: 200,
    height: 54,
    className: "w-[200px] h-[54px] object-contain",
  },
  {
    type: "image",
    href: "https://open-launch.com/projects/restaurant-site-finder",
    src: "https://open-launch.com/api/badge/7193c6a8-bb4f-4668-af13-da78d0d7a545/featured-light.svg",
    alt: "Featured on Open-Launch",
    width: 200,
    height: 50,
    className: "w-[200px] h-[50px] object-contain",
  },
];

function FeaturedItemContent({ item }: { item: FeaturedItem }) {
  if (item.type === "image") {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer">
        <img
          src={item.src}
          alt={item.alt}
          width={item.width}
          height={item.height}
          className={item.className}
          loading="lazy"
        />
      </a>
    );
  }

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
    >
      {item.label}
    </a>
  );
}

export function FeaturedAtSection() {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
        Featured At
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-4">
        {FEATURED_ITEMS.map((item, index) => (
          <div key={item.href} className="flex items-center gap-3">
            {index > 0 && (
              <span className="hidden sm:inline text-muted-foreground/40 select-none" aria-hidden="true">
                ·
              </span>
            )}
            <FeaturedItemContent item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
