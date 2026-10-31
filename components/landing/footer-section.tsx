import Image from "next/image";
import { cacheLife } from "next/cache";
import { FooterNewsletterForm } from "@/components/footer-newsletter-form";

async function getCurrentYear() {
  "use cache";
  cacheLife("max");
  return new Date().getFullYear();
}

export async function FooterSection() {
  const currentYear = await getCurrentYear();

  return (
    <footer className="relative border-t border-border/40 mt-20 md:mt-28 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 sm:pt-20 pb-8 sm:pb-12">
        {/* Top row: Brand & Newsletter + 4 Navigation Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-14 sm:pb-16">
          {/* Left Column: Brand & Newsletter */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-foreground group"
            >
              <Image
                src="/solodesk_no_bg_no_text.png"
                alt=""
                width={18}
                height={18}
                className="size-4.5 object-contain"
              />
              <span className="font-semibold text-foreground text-base tracking-tight">
                SoloDesk
              </span>
            </a>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mt-4">
              The platform for teams that ship. Subscribe to get product
              updates, once a month. No spam.
            </p>

            <FooterNewsletterForm />
          </div>

          {/* Right Columns: 4 Navigation Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Product */}
            <div className="flex flex-col gap-3.5">
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                Product
              </h3>
              <nav
                aria-label="Product links"
                className="flex flex-col gap-2.5 text-sm"
              >
                <a
                  href="/#features"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </a>
                <a
                  href="/#how-it-works"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="/#tour"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Integrations
                </a>
                <a
                  href="/#roadmap"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Changelog
                </a>
                <a
                  href="/#roadmap"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Roadmap
                </a>
              </nav>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-3.5">
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                Company
              </h3>
              <nav
                aria-label="Company links"
                className="flex flex-col gap-2.5 text-sm"
              >
                <a
                  href="/#why-solodesk"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </a>
                <a
                  href="/#tour"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </a>
                <a
                  href="/#contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Careers
                </a>
                <a
                  href="/#audience"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Customers
                </a>
                <a
                  href="/#contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </nav>
            </div>

            {/* Resources */}
            <div className="flex flex-col gap-3.5">
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                Resources
              </h3>
              <nav
                aria-label="Resources links"
                className="flex flex-col gap-2.5 text-sm"
              >
                <a
                  href="/#tour"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documentation
                </a>
                <a
                  href="/#how-it-works"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Guides
                </a>
                <a
                  href="/#security"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  API reference
                </a>
                <a
                  href="/#contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Community
                </a>
                <a
                  href="/#security"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Status
                </a>
              </nav>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-3.5">
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                Legal
              </h3>
              <nav
                aria-label="Legal links"
                className="flex flex-col gap-2.5 text-sm"
              >
                <a
                  href="/#security"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="/#security"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms
                </a>
                <a
                  href="/#security"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Security
                </a>
                <a
                  href="/#security"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cookies
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Sub-Footer Divider & Metadata Bar */}
        <div className="border-t border-border/40 pt-8 pb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground">
          {/* Copyright & System Status */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span>© {currentYear} SoloDesk, Inc.</span>
            <div className="inline-flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs sm:text-sm">
                All systems operational
              </span>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-5 text-muted-foreground">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors p-1 -m-1"
              aria-label="GitHub"
            >
              <svg
                className="size-4.5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors p-1 -m-1"
              aria-label="X (Twitter)"
            >
              <svg
                className="size-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors p-1 -m-1"
              aria-label="LinkedIn"
            >
              <svg
                className="size-4.5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors p-1 -m-1"
              aria-label="YouTube"
            >
              <svg
                className="size-4.5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Giant Backdrop Watermark Typography */}
        <div className="w-full flex justify-center items-center overflow-hidden pointer-events-none select-none pt-4 sm:pt-8 -mb-4 sm:-mb-8 md:-mb-12">
          <span className="text-[17vw] sm:text-[18vw] lg:text-[230px] font-black tracking-tighter text-foreground/[0.04] dark:text-foreground/[0.04] leading-none select-none">
            SoloDesk
          </span>
        </div>
      </div>
    </footer>
  );
}
