"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const roles = [
  "background",
  "foreground",
  "card",
  "primary",
  "primary-foreground",
  "secondary",
  "muted",
  "muted-foreground",
  "accent",
  "destructive",
  "border",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
];

type Themes = Record<"light" | "dark", Record<string, string>>;

export function DesignSystemShowcase({ themes }: { themes: Themes }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <div className={cn(theme, "min-h-svh bg-background text-foreground")}>
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-5 py-6 sm:px-8 sm:py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className={buttonVariants({ variant: "ghost", size: "lg" })}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to SoloDesk
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <Moon data-icon="inline-start" />
            ) : (
              <Sun data-icon="inline-start" />
            )}
            Switch to {theme === "light" ? "dark" : "light"}
          </Button>
        </header>

        <main className="flex flex-col gap-12">
          <section
            className="flex flex-col gap-4"
            aria-labelledby="design-heading"
          >
            <h1
              id="design-heading"
              className="text-4xl font-medium tracking-tight sm:text-5xl"
            >
              SoloDesk design system
            </h1>
            <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
              Monochrome surfaces, clear typography and quiet depth. This is the
              shared
              {theme === "light" ? " light" : " dark"} theme, built with
              semantic tokens and shadcn/ui.
            </p>
            <p className="text-sm text-muted-foreground">
              Rugis / Sahabah headings · Geist body · Geist Mono data · 8px base
              radius
            </p>
          </section>

          <Separator />

          <section
            className="flex flex-col gap-6"
            aria-labelledby="type-heading"
          >
            <h2 id="type-heading" className="text-xl font-medium">
              Typography
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex flex-col gap-3">
                <h3 className="text-3xl font-medium tracking-tight">
                  Space to focus.
                </h3>
                <p className="max-w-prose leading-relaxed text-muted-foreground">
                  Rugis for English headings and Sahabah for Arabic titles.
                  Geist keeps body text, navigation and forms clear in both
                  themes.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <h3 lang="ar" dir="rtl" className="text-2xl leading-relaxed">
                  مساحة للتركيز والعمل بوضوح.
                </h3>
                <p className="font-mono text-lg tabular-nums">
                  01:24:08 · $1,248.00
                </p>
                <p className="text-sm text-muted-foreground">
                  Illustrative type samples; no live account data.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section
            className="flex flex-col gap-6"
            aria-labelledby="components-heading"
          >
            <h2 id="components-heading" className="text-xl font-medium">
              Shared components
            </h2>
            <div className="flex flex-wrap gap-3">
              <Button size="lg">Primary</Button>
              <Button size="lg" variant="secondary">
                Secondary
              </Button>
              <Button size="lg" variant="outline">
                Outline
              </Button>
              <Button size="lg" variant="ghost">
                Ghost
              </Button>
              <Button size="lg" disabled>
                Disabled
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="sample-name">Example field</FieldLabel>
                <Input
                  id="sample-name"
                  placeholder="A clear, descriptive name"
                />
              </Field>
              <Field data-disabled>
                <FieldLabel htmlFor="sample-disabled">
                  Disabled field
                </FieldLabel>
                <Input
                  id="sample-disabled"
                  placeholder="Unavailable"
                  disabled
                />
              </Field>
            </div>
            <p className="text-sm text-muted-foreground">
              Component examples only. Inputs are local to this preview and do
              not save records.
            </p>
          </section>

          <Separator />

          <section
            className="flex flex-col gap-6"
            aria-labelledby="depth-heading"
          >
            <h2 id="depth-heading" className="text-xl font-medium">
              Surface and depth
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {(["sm", "md", "lg"] as const).map((shadow) => (
                <div
                  key={shadow}
                  className="rounded-xl bg-card p-6 text-card-foreground"
                  style={{ boxShadow: `var(--shadow-${shadow})` }}
                >
                  <p className="font-medium">Shadow {shadow}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Compact, soft elevation.
                  </p>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          <section
            className="flex flex-col gap-6"
            aria-labelledby="tokens-heading"
          >
            <h2 id="tokens-heading" className="text-xl font-medium">
              Semantic colors
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <div key={role} className="flex min-w-0 flex-col gap-2">
                  <div
                    className="h-16 rounded-lg border border-border"
                    style={{ backgroundColor: `var(--${role})` }}
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium">{role}</p>
                  <code className="break-all font-mono text-xs leading-relaxed text-muted-foreground">
                    {themes[theme][role]}
                  </code>
                </div>
              ))}
            </div>
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
              Amber and blue belong to charts. Keep labels readable and do not
              use color alone to convey status. The supplied destructive, chart
              and input-border combinations still need contrast-safe usage; the
              palette alone does not certify accessibility.
            </p>
          </section>
        </main>

        <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
          Shared tokens are defined in app/globals.css. Light is the default;
          this preview scopes Dark without changing your account or storing a
          preference.
        </footer>
      </div>
    </div>
  );
}
