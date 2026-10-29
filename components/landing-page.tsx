import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Check, Circle, Clock3, FileText, FolderKanban } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/site-header";
import { previewInvoiceAmount, previewProjects, previewTasks } from "@/lib/site-content";

async function WorkPreview() {
  const t = await getTranslations("Landing");
  return <figure className="work-preview">
    <div className="preview-topbar"><span className="flex items-center gap-2 font-medium"><Image src="/solodesk_no_bg_no_text.png" width={20} height={20} alt="" /><bdi>SoloDesk</bdi></span><span className="text-muted-foreground">{t("week")}</span></div>
    <div className="preview-body">
      <aside className="preview-sidebar" aria-hidden="true"><FolderKanban /><Clock3 /><FileText /></aside>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-8"><h2 className="text-xl font-medium sm:text-2xl">{t("overview")}</h2><span className="text-xs text-muted-foreground">{t("previewShort")}</span></div>
        <div className="project-grid project-table-head"><span>{t("project")}</span><span>{t("status")}</span><span>{t("time")}</span></div>
        {previewProjects.map((project) => <div key={project.name} className="project-grid project-row"><span className="font-medium">{t(project.name)}</span><span className="text-muted-foreground">{t(project.status)}</span><span className="font-mono tabular-nums"><bdi>{t("hours",{hours:project.hours,minutes:project.minutes})}</bdi></span></div>)}
        <div className="preview-summary"><Clock3 aria-hidden="true" className="size-5" /><span>{t("focus")}</span><span className="ms-auto font-mono text-xl tabular-nums"><bdi>{t("hours",{hours:22,minutes:45})}</bdi></span></div>
      </div>
    </div>
    <figcaption>{t("preview")}</figcaption>
  </figure>;
}

async function TaskPreview() {
  const t = await getTranslations("Landing");
  return <figure className="workflow-preview">
    <div className="flex items-center justify-between gap-4"><FolderKanban className="size-6" aria-hidden="true" /><span className="text-xs text-muted-foreground">{t("previewShort")}</span></div>
    <p className="mt-7 text-xl font-medium">{t("studio")}</p>
    <ul className="mt-5 flex flex-col">{previewTasks.map((task) => <li key={task.name} className="flex items-center gap-3 border-b border-border py-5">{task.done ? <Check className="size-4 shrink-0" aria-hidden="true" /> : <Circle className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}<span>{t(task.name)}</span><span className="ms-auto text-xs text-muted-foreground">{t(task.done?"done":"next")}</span></li>)}</ul>
    <figcaption className="mt-7 text-xs text-muted-foreground">{t("preview")}</figcaption>
  </figure>;
}

async function InvoicePreview() {
  const t = await getTranslations("Landing");
  return <figure className="workflow-preview invoice-preview">
    <div className="flex items-center justify-between gap-4"><FileText className="size-6" aria-hidden="true" /><span className="text-xs text-muted-foreground">{t("invoiceStatus")}</span></div>
    <p className="mt-8 text-sm text-muted-foreground">{t("invoice")}</p>
    <p className="mt-2 font-mono text-4xl tabular-nums"><bdi>{t("amount",{amount:previewInvoiceAmount})}</bdi></p>
    <Separator className="my-7" />
    <dl className="flex flex-col gap-5 text-sm"><div className="flex flex-wrap justify-between gap-3"><dt className="text-muted-foreground">{t("client")}</dt><dd>{t("sampleClient")}</dd></div><div className="flex flex-wrap justify-between gap-3"><dt className="text-muted-foreground">{t("invoiceItem")}</dt><dd className="font-mono"><bdi>{t("hours",{hours:20,minutes:0})}</bdi></dd></div></dl>
    <figcaption className="mt-8 text-xs text-muted-foreground">{t("preview")}</figcaption>
  </figure>;
}

export async function LandingPage() {
  const t = await getTranslations("Landing");
  const c = await getTranslations("Common");
  const n = await getTranslations("Navigation");
  return <>
    <SiteHeader />
    <main id="main-content">
      <section className="hero site-container" aria-labelledby="hero-heading">
        <h1 id="hero-heading" className="hero-title">{t("title")}</h1>
        <p className="hero-description">{t("description")}</p>
        <div className="flex flex-wrap justify-center gap-3"><a href="/sign-up" className={buttonVariants({size:"lg"})}>{c("getStarted")}<ArrowUpRight data-icon="inline-end" aria-hidden="true" /></a><a href="/#features" className={buttonVariants({variant:"outline",size:"lg"})}>{c("explore")}</a></div>
        <div className="hero-preview"><WorkPreview /></div>
      </section>
      <section id="features" className="site-section site-container" aria-labelledby="features-heading">
        <div className="section-intro"><h2 id="features-heading" className="section-title">{t("featureHeading")}</h2><p>{t("featureDescription")}</p></div>
        <div className="capabilities">
          {[{Icon:FolderKanban,title:"projectsTitle",body:"projectsBody"},{Icon:Clock3,title:"timeTitle",body:"timeBody"},{Icon:FileText,title:"invoicesTitle",body:"invoicesBody"}].map(({Icon,title,body}) => <Card key={title} className="capability"><CardHeader><Icon className="mb-8 size-7" aria-hidden="true" /><CardTitle><h3>{t(title as "projectsTitle")}</h3></CardTitle><CardDescription>{t(body as "projectsBody")}</CardDescription></CardHeader><CardContent><div className="capability-line" aria-hidden="true" /></CardContent><CardFooter><p>{t("previewShort")}</p></CardFooter></Card>)}
        </div>
      </section>
      <section id="how-it-works" className="site-section site-container" aria-labelledby="workflow-heading">
        <h2 id="workflow-heading" className="section-title max-w-xl">{t("workflowTitle")}</h2>
        <div className="workflow-row"><div className="workflow-copy"><h3>{t("workTitle")}</h3><p>{t("workBody")}</p><a href="/sign-up" className={buttonVariants({variant:"outline",size:"lg"})}>{c("getStarted")}<ArrowUpRight data-icon="inline-end" aria-hidden="true" /></a></div><TaskPreview /></div>
        <div className="workflow-row workflow-reverse"><div className="workflow-copy"><h3>{t("timeWorkTitle")}</h3><p>{t("timeWorkBody")}</p><a href="/sign-up" className={buttonVariants({variant:"outline",size:"lg"})}>{c("getStarted")}<ArrowUpRight data-icon="inline-end" aria-hidden="true" /></a></div><InvoicePreview /></div>
      </section>
      <section className="closing site-container" aria-labelledby="closing-heading"><h2 id="closing-heading" className="section-title">{t("closing")}</h2><p>{t("closingBody")}</p><a href="/sign-up" className={buttonVariants({size:"lg"})}>{c("getStarted")}<ArrowUpRight data-icon="inline-end" aria-hidden="true" /></a><p className="text-xs text-muted-foreground">{t("accountAvailable")}</p></section>
    </main>
    <footer className="site-footer site-container"><div><a href="/" className="brand-link"><Image src="/solodesk_logo_transparent.png" width={169} height={47} alt="SoloDesk" className="brand-wordmark" /></a><p>{t("footer")}</p></div><nav aria-label={n("label")}><a href="/#features">{n("features")}</a><a href="/sign-in">{n("signIn")}</a><a href="/sign-up">{n("signUp")}</a></nav><p>{t("rights")}</p></footer>
  </>;
}
