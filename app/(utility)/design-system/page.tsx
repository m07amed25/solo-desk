import type { Metadata } from "next";
import { DesignSystemShowcase } from "@/components/design-system-showcase";
import tokens from "@/docs/design/tokens.json";

export const metadata: Metadata = {
  title: "SoloDesk • Design System Specification",
  description:
    "The SoloDesk monochrome Light/Dark theme, Geist typography, shared components and semantic tokens.",
};

export default function DesignSystemPage() {
  return <DesignSystemShowcase themes={tokens.cssVariables} />;
}
