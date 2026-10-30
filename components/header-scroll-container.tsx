"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
  type ReactNode,
} from "react";

const ActiveSectionContext = createContext<string>("");

export function useActiveSection() {
  return useContext(ActiveSectionContext);
}

const SECTION_IDS = [
  "hero",
  "tour",
  "features",
  "how-it-works",
  "why-solodesk",
  "security",
  "audience",
  "faq",
  "contact",
];

export function HeaderScrollContainer({ children }: { children: ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 32);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // IntersectionObserver for active section
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      },
    );

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <ActiveSectionContext.Provider value={activeSection}>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-200 ${
          isScrolled
            ? "border-b border-border/80 bg-background/85 backdrop-blur-md shadow-xs"
            : "border-b border-transparent bg-background/0"
        }`}
      >
        <div
          className={`site-header site-container transition-all duration-200 ${
            isScrolled
              ? "min-h-[72px] lg:min-h-[76px] py-2"
              : "min-h-[80px] lg:min-h-[96px] py-4"
          }`}
        >
          {children}
        </div>
      </header>
    </ActiveSectionContext.Provider>
  );
}

export function HeaderNavLink({
  href,
  sectionId,
  children,
  className = "",
}: {
  href: string;
  sectionId: string;
  children: ReactNode;
  className?: string;
}) {
  const activeSection = useActiveSection();
  const isActive = activeSection === sectionId;

  return (
    <a
      href={href}
      aria-current={isActive ? "true" : undefined}
      className={`${className} transition-colors ${
        isActive
          ? "text-foreground font-semibold"
          : "text-muted-foreground hover:text-foreground font-medium"
      }`}
    >
      {children}
    </a>
  );
}
