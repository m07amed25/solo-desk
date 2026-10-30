"use client";

import { useState, useRef, useId, type KeyboardEvent } from "react";
import {
  Users,
  FolderKanban,
  Clock3,
  FileText,
  TrendingUp,
  Check,
} from "lucide-react";
import {
  capabilityAreas,
  previewClients,
  previewProjects,
  previewTasks,
  previewInvoiceAmount,
  previewInsights,
  type AvailabilityStatus,
} from "@/lib/site-content";

interface TourMessages {
  heading?: string;
  statusAvailable: string;
  statusInDevelopment: string;
  statusPlanned: string;
  previewNote: string;
  clients: {
    title: string;
    outcome: string;
    details: string[];
  };
  projects: {
    title: string;
    outcome: string;
    details: string[];
  };
  time: {
    title: string;
    outcome: string;
    details: string[];
  };
  invoices: {
    title: string;
    outcome: string;
    details: string[];
  };
  insights: {
    title: string;
    outcome: string;
    details: string[];
  };
}

interface ProductTourProps {
  messages: TourMessages;
}

const iconMap = {
  clients: Users,
  projects: FolderKanban,
  time: Clock3,
  invoices: FileText,
  insights: TrendingUp,
} as const;

function getStatusBadge(status: AvailabilityStatus, messages: TourMessages) {
  const label =
    status === "available"
      ? messages.statusAvailable
      : status === "inDevelopment"
        ? messages.statusInDevelopment
        : messages.statusPlanned;

  return (
    <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-2.5 py-0.5 text-xs font-normal text-muted-foreground">
      {label}
    </span>
  );
}

export function ProductTour({ messages }: ProductTourProps) {
  const [activeTab, setActiveTab] = useState<string>("clients");
  const tabListRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    const tabs = capabilityAreas;
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    const nextId = tabs[nextIndex].id;
    setActiveTab(nextId);
    const nextButton = tabListRef.current?.querySelector<HTMLButtonElement>(
      `[data-tab-id="${nextId}"]`,
    );
    nextButton?.focus();
  };

  return (
    <div className="product-tour flex flex-col gap-6">
      {/* Quiet Tab Navigation */}
      <div
        ref={tabListRef}
        role="tablist"
        aria-label={messages.heading || "Product capability tour"}
        className="flex flex-wrap gap-1.5 border-b border-border/40 pb-3"
      >
        {capabilityAreas.map((area, index) => {
          const isSelected = activeTab === area.id;
          const Icon = iconMap[area.id];
          const areaCopy = messages[area.id];

          return (
            <button
              key={area.id}
              role="tab"
              id={`${baseId}-tab-${area.id}`}
              data-tab-id={area.id}
              aria-selected={isSelected}
              aria-controls={`${baseId}-panel-${area.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setActiveTab(area.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`group inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isSelected
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              }`}
            >
              <Icon
                className={`size-4 shrink-0 transition-colors ${
                  isSelected
                    ? "text-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
                aria-hidden="true"
              />
              <span>{areaCopy.title}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="tour-panels min-w-0">
        {capabilityAreas.map((area) => {
          const isSelected = activeTab === area.id;
          const areaCopy = messages[area.id];

          return (
            <div
              key={area.id}
              role="tabpanel"
              id={`${baseId}-panel-${area.id}`}
              aria-labelledby={`${baseId}-tab-${area.id}`}
              hidden={!isSelected}
              tabIndex={0}
              className={`outline-none ${!isSelected ? "hidden" : "block animate-in fade-in-50 duration-200"}`}
            >
              <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                {/* Content Column */}
                <div className="flex flex-col gap-4 lg:col-span-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-sans text-xl font-medium tracking-tight text-foreground">
                      {areaCopy.title}
                    </h3>
                    {getStatusBadge(area.status, messages)}
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {areaCopy.outcome}
                  </p>

                  <ul className="flex flex-col gap-2.5 pt-1">
                    {areaCopy.details.map((detail, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground/90"
                      >
                        <span
                          className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/50"
                          aria-hidden="true"
                        />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Synthetic Mockup Column */}
                <div className="lg:col-span-7">
                  <div className="rounded-xl border border-border/50 bg-card/40 p-5 sm:p-6">
                    <div className="mb-4 flex items-center justify-between border-b border-border/30 pb-3 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">
                        {areaCopy.title}
                      </span>
                      <span>{messages.previewNote}</span>
                    </div>

                    {/* Area variants */}
                    {area.id === "clients" && (
                      <div className="flex flex-col divide-y divide-border/30">
                        {previewClients.map((client) => (
                          <div
                            key={client.name}
                            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                          >
                            <div className="flex flex-col gap-0.5">
                              <p className="text-sm font-medium text-foreground">
                                {client.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                <bdi>{client.activeProjects}</bdi> active
                                projects · Currency:{" "}
                                <bdi className="font-mono">
                                  {client.currency}
                                </bdi>
                              </p>
                            </div>
                            <div className="font-mono text-xs tabular-nums text-muted-foreground">
                              <bdi>{client.totalHours} hrs logged</bdi>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {area.id === "projects" && (
                      <div className="flex flex-col divide-y divide-border/30">
                        {previewTasks.map((task) => (
                          <div
                            key={task.name}
                            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`flex size-4 items-center justify-center rounded border ${
                                  task.done
                                    ? "border-foreground/40 bg-foreground/10 text-foreground"
                                    : "border-border text-transparent"
                                }`}
                                aria-hidden="true"
                              >
                                {task.done && <Check className="size-3" />}
                              </span>
                              <span
                                className={`text-sm ${
                                  task.done
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground"
                                }`}
                              >
                                {task.name === "taskOne"
                                  ? "Map core workspace architecture"
                                  : task.name === "taskTwo"
                                    ? "Implement token rate limiter"
                                    : "Conduct RTL accessibility audit"}
                              </span>
                            </div>
                            <span className="font-mono text-xs text-muted-foreground/80">
                              {task.done ? "Verified" : "In Progress"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {area.id === "time" && (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="size-2 rounded-full bg-emerald-500/80 inline-block" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Active Timer
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                API Contract Hardening
                              </p>
                            </div>
                          </div>
                          <div className="font-mono text-lg font-medium tabular-nums text-foreground">
                            <bdi>02:45:18</bdi>
                          </div>
                        </div>
                        <div className="flex flex-col divide-y divide-border/30 pt-1">
                          {previewProjects.map((p) => (
                            <div
                              key={p.name}
                              className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 text-xs"
                            >
                              <span className="text-muted-foreground capitalize">
                                {p.name}
                              </span>
                              <span className="font-mono text-foreground tabular-nums">
                                <bdi>
                                  {p.hours}h {p.minutes}m
                                </bdi>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {area.id === "invoices" && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between pb-2 border-b border-border/30">
                          <div>
                            <p className="font-mono text-xs text-muted-foreground">
                              INV-2026-084
                            </p>
                            <p className="text-sm font-medium text-foreground">
                              North Studio LLC
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground border border-border/50 rounded-full px-2 py-0.5">
                            Due in 14 days
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5 py-1 text-xs text-muted-foreground">
                          <div className="flex justify-between">
                            <span>
                              Frontend Architecture & Delivery (20 hrs)
                            </span>
                            <span className="font-mono tabular-nums text-foreground">
                              <bdi>$2,500.00</bdi>
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bilingual RTL & Accessibility Audit</span>
                            <span className="font-mono tabular-nums text-foreground">
                              <bdi>$750.00</bdi>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-border/30 pt-2.5">
                          <span className="text-xs font-medium text-muted-foreground">
                            Total Balance Due
                          </span>
                          <span className="font-mono text-base font-semibold tabular-nums text-foreground">
                            <bdi>
                              $
                              {previewInvoiceAmount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                              })}
                            </bdi>
                          </span>
                        </div>
                      </div>
                    )}

                    {area.id === "insights" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-border/30 bg-muted/10 p-3.5">
                          <p className="text-xs text-muted-foreground">
                            Monthly Focus Hours
                          </p>
                          <p className="mt-1 font-mono text-lg font-medium tabular-nums text-foreground">
                            <bdi>{previewInsights.monthlyHours}</bdi>{" "}
                            <span className="text-xs font-normal text-muted-foreground">
                              hrs
                            </span>
                          </p>
                        </div>
                        <div className="rounded-lg border border-border/30 bg-muted/10 p-3.5">
                          <p className="text-xs text-muted-foreground">
                            Billable Ratio
                          </p>
                          <p className="mt-1 font-mono text-lg font-medium tabular-nums text-foreground">
                            <bdi>{previewInsights.billableRatio}</bdi>
                          </p>
                        </div>
                        <div className="rounded-lg border border-border/30 bg-muted/10 p-3.5">
                          <p className="text-xs text-muted-foreground">
                            Active Workspaces
                          </p>
                          <p className="mt-1 font-mono text-lg font-medium tabular-nums text-foreground">
                            <bdi>{previewInsights.activeProjects}</bdi>
                          </p>
                        </div>
                        <div className="rounded-lg border border-border/30 bg-muted/10 p-3.5">
                          <p className="text-xs text-muted-foreground">
                            Invoiced YTD (USD)
                          </p>
                          <p className="mt-1 font-mono text-lg font-medium tabular-nums text-foreground">
                            <bdi>
                              $
                              {previewInsights.invoicedYTD.toLocaleString(
                                "en-US",
                              )}
                            </bdi>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
