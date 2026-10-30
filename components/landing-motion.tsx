"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

export function LandingMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const media = gsap.matchMedia();

    media.add(
      {
        desktop: "(min-width: 1024px)",
        compact: "(max-width: 1023px)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        if (context.conditions?.reduce || !root.current) return;

        const lenis = new Lenis({ anchors: true, allowNestedScroll: true });
        lenis.on("scroll", ScrollTrigger.update);
        // Use real milliseconds so GSAP lag smoothing cannot desync scrolling.
        const advanceScroll = () => lenis.raf(performance.now());
        gsap.ticker.add(advanceScroll);

        const desktop = context.conditions?.desktop;
        const select = gsap.utils.selector(root);
        const hero = select("#hero")[0];
        const preview = select(".hero-preview")[0];
        const rtl = getComputedStyle(root.current).direction === "rtl";

        const headline = SplitText.create(select(".hero-title"), {
          // Arabic letters must stay joined to preserve contextual shaping.
          type: rtl ? "words" : "words,chars",
          charsClass: "hero-character",
          wordsClass: "hero-word",
          aria: "auto",
          reduceWhiteSpace: false,
          autoSplit: true,
          onSplit(split) {
            return gsap.from(rtl ? split.words : split.chars, {
              yPercent: desktop ? 90 : 50,
              rotationX: desktop ? -65 : 0,
              transformPerspective: 800,
              opacity: 0,
              duration: 0.75,
              stagger: { amount: 0.55 },
              ease: "expo.out",
              onComplete: () => split.revert(),
            });
          },
        });

        gsap.from("[data-hero-copy] > :not(h1)", {
          y: desktop ? 40 : 16,
          opacity: 0.6,
          duration: 0.8,
          stagger: 0.09,
          delay: 0.35,
          ease: "expo.out",
          clearProps: "transform,opacity",
        });

        gsap.to("[data-hero-copy]", {
          y: desktop ? -120 : -32,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        gsap.fromTo(
          preview,
          {
            y: desktop ? 96 : 24,
            rotationX: desktop ? 14 : 0,
            scale: desktop ? 0.88 : 0.97,
            transformPerspective: 1400,
            transformOrigin: "50% 0%",
          },
          {
            y: 0,
            rotationX: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: preview,
              start: "top bottom",
              end: "top 22%",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );

        gsap.from(".project-row", {
          x: rtl ? -24 : 24,
          opacity: 0.65,
          stagger: 0.1,
          duration: 0.6,
          ease: "expo.out",
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: preview, start: "top 65%", once: true },
        });

        for (const section of select(".site-section")) {
          const intro = section.querySelector(".section-intro");
          if (!intro) continue;
          const body = [...section.children].filter((child) => child !== intro);

          gsap.fromTo(
            intro,
            { y: desktop ? 72 : 24 },
            {
              y: desktop ? -24 : 0,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "top top",
                scrub: true,
              },
            },
          );

          if (!body.length || section.id === "faq" || section.id === "contact")
            continue;

          gsap.fromTo(
            body,
            { y: desktop ? 112 : 32 },
            {
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "top 20%",
                scrub: true,
              },
            },
          );
        }

        gsap.from("[data-journey-step]", {
          y: desktop ? -32 : -12,
          rotationX: desktop ? -8 : 0,
          transformPerspective: 1000,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "[data-journey]",
            start: "top 95%",
            end: "top 40%",
            scrub: true,
          },
        });

        gsap.from("#closing > *", {
          y: desktop ? 24 : 12,
          duration: 0.65,
          ease: "expo.out",
          clearProps: "transform",
          scrollTrigger: { trigger: "#closing", start: "top 80%", once: true },
        });

        // Fonts, tour tabs and FAQ disclosure can all change section positions.
        const observer = new ResizeObserver(() => ScrollTrigger.refresh());
        observer.observe(root.current);
        return () => {
          gsap.ticker.remove(advanceScroll);
          lenis.destroy();
          observer.disconnect();
          headline.revert();
        };
      },
      root,
    );

    return () => media.revert();
  }, []);

  return (
    <main id="main-content" ref={root} className="landing-motion">
      {children}
    </main>
  );
}
