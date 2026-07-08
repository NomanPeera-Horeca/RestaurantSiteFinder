const FEATURED_BADGES = [
  {
    href: "https://submitaitools.org",
    src: "https://submitaitools.org/static_submitaitools/images/submitaitools.png",
    alt: "Submit AI Tools",
    width: 200,
    height: 60,
    className: "rounded-[10px] w-[200px] h-[60px] object-contain",
  },
  {
    href: "https://findly.tools/restaurant-site-finder?utm_source=restaurant-site-finder",
    src: "https://findly.tools/badges/findly-tools-badge-light.svg",
    alt: "Featured on Findly.tools",
    width: 175,
    height: 55,
    className: "w-[175px] h-[55px] object-contain",
  },
] as const;

export function FeaturedAtSection() {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
        Featured At
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-4">
        {FEATURED_BADGES.map((badge, index) => (
          <div key={badge.href} className="flex items-center gap-3">
            {index > 0 && (
              <span className="hidden sm:inline text-muted-foreground/40 select-none" aria-hidden="true">
                ·
              </span>
            )}
            <a href={badge.href} target="_blank" rel="noopener noreferrer">
              <img
                src={badge.src}
                alt={badge.alt}
                width={badge.width}
                height={badge.height}
                className={badge.className}
                loading="lazy"
              />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
