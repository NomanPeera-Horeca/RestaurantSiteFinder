import { Link } from "wouter";
import { MapPin } from "lucide-react";
import { HORECA } from "@/lib/horeca-brand";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  active?: "home" | "name-generator";
}

export function SiteHeader({ active }: SiteHeaderProps) {
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
          <Link
            href="/name-generator"
            className={cn(
              "text-xs sm:text-sm font-medium transition-colors",
              active === "name-generator" ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            Name Generator
          </Link>
          <a
            href="/blog"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:inline"
          >
            Guides
          </a>
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
