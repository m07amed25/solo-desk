import { Badge } from "@/components/ui/badge";
import type { AvailabilityStatus } from "@/lib/site-content";

export function StatusBadge({
  status,
  availableLabel,
  inDevelopmentLabel,
  plannedLabel,
  variant = "badge",
}: {
  status: AvailabilityStatus;
  availableLabel: string;
  inDevelopmentLabel: string;
  plannedLabel: string;
  variant?: "badge" | "quiet";
}) {
  if (variant === "quiet") {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="size-1.5 rounded-full bg-emerald-500/80 inline-block"
              aria-hidden="true"
            />
            <span>{availableLabel}</span>
          </span>
        );
      case "inDevelopment":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="size-1.5 rounded-full bg-amber-500/80 inline-block"
              aria-hidden="true"
            />
            <span>{inDevelopmentLabel}</span>
          </span>
        );
      case "planned":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/75">
            <span
              className="size-1.5 rounded-full bg-muted-foreground/40 inline-block"
              aria-hidden="true"
            />
            <span>{plannedLabel}</span>
          </span>
        );
    }
  }

  switch (status) {
    case "available":
      return (
        <Badge variant="default" className="gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-400 inline-block" />
          <span>{availableLabel}</span>
        </Badge>
      );
    case "inDevelopment":
      return (
        <Badge variant="secondary" className="gap-1.5">
          <span className="size-1.5 rounded-full bg-amber-400 inline-block" />
          <span>{inDevelopmentLabel}</span>
        </Badge>
      );
    case "planned":
    default:
      return (
        <Badge variant="outline" className="gap-1.5">
          <span className="size-1.5 rounded-full bg-muted-foreground/60 inline-block" />
          <span>{plannedLabel}</span>
        </Badge>
      );
  }
}
