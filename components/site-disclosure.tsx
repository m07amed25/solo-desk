"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function SiteDisclosure({menuLabel, children}: {menuLabel: string; children: ReactNode}) {
  const details = useRef<HTMLDetailsElement>(null);
  function close() { if (details.current) details.current.open = false; }
  return <details ref={details} className="site-disclosure lg:hidden" onKeyDown={(event) => {
    if (event.key === "Escape" && details.current?.open) {
      event.preventDefault(); close(); details.current.querySelector("summary")?.focus();
    }
  }} onClick={(event) => { if ((event.target as Element).closest("a")) close(); }}>
    <summary className={buttonVariants({variant:"ghost",size:"icon-lg"})} aria-label={menuLabel} title={menuLabel}>
      <Menu aria-hidden="true" /><span className="sr-only">{menuLabel}</span>
    </summary>
    <div className="disclosure-panel">{children}</div>
  </details>;
}
