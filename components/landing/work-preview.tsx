import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Clock3, FileText, FolderKanban } from "lucide-react";
import { previewProjects } from "@/lib/site-content";

export async function WorkPreview() {
  const t = await getTranslations("Landing");
  return (
    <figure className="work-preview">
      <div className="preview-topbar">
        <span className="flex items-center gap-2 font-medium">
          <Image
            src="/solodesk_no_bg_no_text.png"
            width={20}
            height={20}
            alt=""
          />
          <bdi>SoloDesk</bdi>
        </span>
        <span className="text-muted-foreground">{t("week")}</span>
      </div>
      <div className="preview-body">
        <aside className="preview-sidebar" aria-hidden="true">
          <FolderKanban />
          <Clock3 />
          <FileText />
        </aside>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-8">
            <h2 className="text-xl font-medium sm:text-2xl">{t("overview")}</h2>
            <span className="text-xs text-muted-foreground">
              {t("previewShort")}
            </span>
          </div>
          <div className="project-grid project-table-head">
            <span>{t("project")}</span>
            <span>{t("status")}</span>
            <span>{t("time")}</span>
          </div>
          {previewProjects.map((project) => (
            <div key={project.name} className="project-grid project-row">
              <span className="font-medium">{t(project.name)}</span>
              <span className="text-muted-foreground">{t(project.status)}</span>
              <span className="font-mono tabular-nums">
                <bdi>
                  {t("hours", {
                    hours: project.hours,
                    minutes: project.minutes,
                  })}
                </bdi>
              </span>
            </div>
          ))}
          <div className="preview-summary">
            <Clock3 aria-hidden="true" className="size-5" />
            <span>{t("focus")}</span>
            <span className="ms-auto font-mono text-xl tabular-nums">
              <bdi>{t("hours", { hours: 22, minutes: 45 })}</bdi>
            </span>
          </div>
        </div>
      </div>
      <figcaption>{t("preview")}</figcaption>
    </figure>
  );
}
