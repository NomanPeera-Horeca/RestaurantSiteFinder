import { Link } from "wouter";
import { ChevronDown, MapPin } from "lucide-react";
import { HORECA } from "@/lib/horeca-brand";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ALL_CITY_CONFIGS } from "@/pages/cities/city-configs";

interface SiteHeaderProps {
  active?: "home" | "name-generator" | "failure-rate" | "rent-calculator" | "location-analysis";
}

const guideActiveKeys = new Set([
  "name-generator",
  "failure-rate",
  "rent-calculator",
  "location-analysis",
]);

export function SiteHeader({ active }: SiteHeaderProps) {
  const guidesActive = active ? guideActiveKeys.has(active) : false;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground truncate">Restaurant Site Finder</span>
          </Link>
          <a
            href={HORECA.website}
            target="_blank"
            rel="noopener"
            className="hidden sm:inline-flex shrink-0 items-center rounded-full border border-border/60 px-2.5 py-0.5 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
          >
            Powered by Horeca Store
          </a>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex items-center gap-1 text-xs sm:text-sm font-medium transition-colors outline-none hidden md:inline-flex",
                active === "location-analysis" ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              Analyze by City
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/restaurant-location-analysis">All US Locations</Link>
              </DropdownMenuItem>
              {ALL_CITY_CONFIGS.map(city => (
                <DropdownMenuItem key={city.slug} asChild>
                  <Link href={city.route}>{city.posthogCity}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex items-center gap-1 text-xs sm:text-sm font-medium transition-colors outline-none",
                guidesActive ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              Guides
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <a href="/blog">All Guides</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/restaurant-location-analysis"
                  className={cn(active === "location-analysis" && "text-primary font-medium")}
                >
                  Location Analysis
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/restaurant-rent-calculator"
                  className={cn(active === "rent-calculator" && "text-primary font-medium")}
                >
                  Rent Calculator
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/restaurant-name-generator"
                  className={cn(active === "name-generator" && "text-primary font-medium")}
                >
                  Name Generator
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/restaurant-failure-rate"
                  className={cn(active === "failure-rate" && "text-primary font-medium")}
                >
                  Restaurant Failure Rate
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/how-to-choose-restaurant-location">
                  How to Choose a Location
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <a
            href="/glossary"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:inline"
          >
            Glossary
          </a>
          <a
            href={HORECA.website}
            target="_blank"
            rel="noopener"
            className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="Visit Horeca Store - Commercial Kitchen Equipment"
          >
            <img
              src={HORECA.logo}
              alt="Horeca Store - Restaurant Supply Store & Commercial Equipment"
              className="h-7"
            />
          </a>
          <a
            href={HORECA.website}
            target="_blank"
            rel="noopener"
            className="hidden sm:flex md:hidden items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            <img src={HORECA.icon} alt="Horeca Store" className="h-6 w-6 rounded" />
            Horeca Store
          </a>
        </div>
      </div>
    </nav>
  );
}
