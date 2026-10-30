"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

export function FooterNewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    // Simulate lightweight subscription action
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      setTimeout(() => {
        setStatus("idle");
      }, 3500);
    }, 600);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center gap-2 max-w-sm mt-5"
    >
      <div className="relative flex-1">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          disabled={status === "loading" || status === "success"}
          aria-label="Email address for updates"
          className="w-full h-10 px-3.5 text-sm rounded-lg bg-zinc-900/60 dark:bg-zinc-900/80 border border-zinc-800 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors disabled:opacity-70"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading" || status === "success"}
        aria-label={
          status === "success" ? "Subscribed" : "Subscribe to updates"
        }
        className="shrink-0 size-10 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95 transition-all flex items-center justify-center shadow-xs cursor-pointer disabled:cursor-default disabled:opacity-90"
      >
        {status === "loading" ? (
          <Loader2 className="size-4 animate-spin text-zinc-950" />
        ) : status === "success" ? (
          <Check className="size-4 text-emerald-600 stroke-[2.5]" />
        ) : (
          <ArrowRight className="size-4 text-zinc-950" />
        )}
      </button>
      {status === "success" && (
        <span
          role="status"
          className="absolute -bottom-6 start-1 text-xs text-emerald-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200"
        >
          Thank you for subscribing!
        </span>
      )}
    </form>
  );
}
