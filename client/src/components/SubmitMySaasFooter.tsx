import { HORECA } from "@/lib/horeca-brand";
import { Link } from "wouter";

const SUBMIT_MY_SAAS_BADGE = {
  href: "https://submitmysaas.com",
  src: "https://submitmysaas.com/featured-badge.png",
  alt: "Featured on SubmitMySaas",
};

export function SubmitMySaasFooter() {
  return (
    <footer className="py-12 border-t border-border bg-card">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          <div>
            <p className="font-semibold text-foreground mb-2">Restaurant Site Finder</p>
            <p className="text-sm text-muted-foreground">
              Free AI restaurant location analysis by{" "}
              <a
                href={HORECA.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {HORECA.name}
              </a>
              .
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-2 text-sm">Resources</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors">
                  Restaurant Guides
                </Link>
              </li>
              <li>
                <Link href="/glossary" className="hover:text-primary transition-colors">
                  Industry Glossary
                </Link>
              </li>
              <li>
                <a href="/about" className="hover:text-primary transition-colors">
                  About
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-2 text-sm">Legal</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                <a href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 pt-6 border-t border-border">
          <a href={SUBMIT_MY_SAAS_BADGE.href} target="_blank" rel="noopener noreferrer">
            <img
              src={SUBMIT_MY_SAAS_BADGE.src}
              alt={SUBMIT_MY_SAAS_BADGE.alt}
              style={{ height: 54, width: "auto" }}
              loading="lazy"
            />
          </a>
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} {HORECA.name}. Restaurant Site Finder is a free tool for
            restaurant owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
