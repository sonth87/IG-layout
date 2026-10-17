"use client";

import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog, PromptDialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { formatBytes, formatRelative } from "@/lib/format";
import type { ProjectType } from "@/lib/project/types";
import { useInstall } from "@/lib/pwa";
import {
  deleteProject,
  listProjects,
  type ProjectMeta,
  renameProject,
  storageEstimate,
} from "@/lib/storage/projects";
import type { Template } from "@/lib/templates/types";
import { useEditor } from "@/store/editor";
import { TemplateLibrary } from "./home/TemplateLibrary";
import { useSettings, useT } from "@/store/settings";

const TYPE_BADGE: Record<ProjectType, string> = {
  post: "bg-accent-soft text-accent-text",
  story: "bg-surface-2 text-text-2",
  grid: "bg-surface-2 text-text-2",
};

function Thumbnail({ blob }: { blob?: Blob }) {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);
  return (
    <div className="h-[75px] w-[60px] shrink-0 overflow-hidden rounded-lg bg-surface-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- local blob thumbnail */}
      {url && <img src={url} alt="" className="h-full w-full object-cover" />}
    </div>
  );
}

function InstallBanner() {
  const t = useT();
  const { mode, install } = useInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  if (!mode || dismissed) return null;

  return (
    <div className="mx-5 mt-2 flex items-center gap-3 rounded-[14px] border border-accent/40 bg-accent-soft px-3.5 py-3">
      <p className="flex-1 text-[13px] leading-snug">
        {showIosHint ? t("install.ios") : t("install.text")}
      </p>
      {mode === "prompt" ? (
        <button type="button" onClick={install} className="h-9 rounded-[10px] bg-accent px-3 text-[13px] font-bold text-on-accent">
          {t("install.button")}
        </button>
      ) : showIosHint ? (
        <button
          type="button"
          aria-label={t("install.dismiss")}
          onClick={() => setDismissed(true)}
          className="flex h-9 w-9 items-center justify-center rounded-[10px]"
        >
          <Icon name="close" size={18} />
        </button>
      ) : (
        <button type="button" onClick={() => setShowIosHint(true)} className="h-9 rounded-[10px] bg-accent px-3 text-[13px] font-bold text-on-accent">
          {t("install.how")}
        </button>
      )}
    </div>
  );
}

export type HomeTab = "templates" | "projects";

export function ProjectsScreen(props: {
  tab: HomeTab;
  onTab: (tab: HomeTab) => void;
  onNew: () => void;
  onUseTemplate: (tpl: Template) => void;
  onSettings: () => void;
  onHelp: () => void;
}) {
  const { tab, onTab, onNew, onSettings, onHelp } = props;
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const openProject = useEditor((s) => s.openProject);
  const [projects, setProjects] = useState<ProjectMeta[] | null>(null);
  const [usage, setUsage] = useState({ usage: 0, quota: 0 });
  const [filter, setFilter] = useState<ProjectType | "all">("all");
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const refresh = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let alive = true;
    Promise.all([listProjects(), storageEstimate()]).then(([list, estimate]) => {
      if (!alive) return;
      setProjects(list);
      setUsage(estimate);
    });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  async function onOpen(id: string) {
    if (!(await openProject(id))) {
      alert(t("projects.openFailed"));
      refresh();
    }
  }

  const [dialog, setDialog] = useState<{ kind: "rename" | "delete"; project: ProjectMeta } | null>(null);

  function onRename(p: ProjectMeta) {
    setMenuFor(null);
    setDialog({ kind: "rename", project: p });
  }

  function onDelete(p: ProjectMeta) {
    setMenuFor(null);
    setDialog({ kind: "delete", project: p });
  }

  const visible = projects?.filter((p) => filter === "all" || p.type === filter) ?? [];
  const usedPct = usage.quota ? Math.min(100, Math.max(1, (usage.usage / usage.quota) * 100)) : 0;
  const filters: (ProjectType | "all")[] = ["all", "post", "story", "grid"];

  const dialogs = dialog && (
    <>
      {dialog.kind === "rename" ? (
        <PromptDialog
          title={t("common.rename")}
          label={t("projects.renamePrompt")}
          initial={dialog.project.name}
          confirmLabel={t("common.save")}
          onCancel={() => setDialog(null)}
          onConfirm={async (name) => {
            setDialog(null);
            if (name !== dialog.project.name) {
              await renameProject(dialog.project.id, name);
              refresh();
            }
          }}
        />
      ) : (
        <ConfirmDialog
          title={t("projects.deleteConfirm", { name: dialog.project.name })}
          confirmLabel={t("common.delete")}
          danger
          onCancel={() => setDialog(null)}
          onConfirm={async () => {
            setDialog(null);
            await deleteProject(dialog.project.id);
            refresh();
          }}
        />
      )}
    </>
  );

  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col md:max-w-3xl lg:max-w-5xl">
      {dialogs}
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t("projects.title")}</h1>
        <div className="flex gap-2">
        <button
          type="button"
          aria-label={t("help.title")}
          onClick={onHelp}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface"
        >
          <Icon name="help" />
        </button>
        <button
          type="button"
          aria-label={t("projects.settings")}
          onClick={onSettings}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface"
        >
          <Icon name="globe" />
        </button>
        </div>
      </header>

      <InstallBanner />

      {/* Home tabs (M10): template library, like SCRL, and the user's projects. */}
      <div role="tablist" aria-label={t("home.tabs")} className="mx-5 mt-3 flex shrink-0 rounded-full bg-surface-2 p-1">
        {(["templates", "projects"] as const).map((tb) => (
          <button
            key={tb}
            type="button"
            role="tab"
            aria-selected={tab === tb}
            onClick={() => onTab(tb)}
            className={`h-9 flex-1 rounded-full text-sm font-semibold ${tab === tb ? "bg-surface shadow-sm" : "text-muted"}`}
          >
            {t(`home.tab.${tb}`)}
          </button>
        ))}
      </div>

      {tab === "templates" ? (
        <TemplateLibrary onUse={props.onUseTemplate} />
      ) : (
      <>
      <div className="mx-5 mt-3.5 flex flex-col gap-1.5">
        <div className="flex justify-between text-[13px] text-muted">
          <span>{t("projects.storage")}</span>
          <span className="font-semibold text-text">{t("projects.used", { size: formatBytes(usage.usage) })}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div className="h-1.5 bg-accent" style={{ width: `${usedPct}%` }} />
        </div>
      </div>

      <nav aria-label={t("projects.filter")} className="flex gap-2 px-5 pt-4 pb-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`h-9 rounded-full px-4 text-sm ${
              filter === f ? "bg-text font-semibold text-bg" : "border border-border"
            }`}
          >
            {f === "all" ? t("projects.all") : t(`type.${f}`)}
          </button>
        ))}
      </nav>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pt-2 pb-4">
        {projects && visible.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
            <p className="font-semibold">{t("projects.empty")}</p>
            <p className="text-sm text-muted">{t("projects.emptyHint")}</p>
          </div>
        )}
        {visible.map((p) => (
          <article key={p.id} className="relative flex items-center gap-3.5 rounded-2xl bg-surface p-3">
            <button type="button" onClick={() => onOpen(p.id)} className="flex min-w-0 flex-1 items-center gap-3.5 text-left">
              <Thumbnail blob={p.thumbnail} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="truncate text-base font-semibold">{p.name}</h2>
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase ${TYPE_BADGE[p.type]}`}>
                    {t(`type.${p.type}`)}
                  </span>
                </div>
                <div className="text-[13px] text-muted">
                  {t(`projects.meta.${p.type}`, { ratio: p.ratio, slides: p.slideCount, rows: Math.ceil(p.slideCount / 3), size: formatBytes(p.size) })}
                </div>
                <div className="text-xs text-muted">
                  {t("projects.edited", { time: formatRelative(p.updatedAt, locale) })}
                </div>
              </div>
            </button>
            <button
              type="button"
              aria-label={t("projects.actions", { name: p.name })}
              aria-expanded={menuFor === p.id}
              onClick={() => setMenuFor(menuFor === p.id ? null : p.id)}
              className="flex h-11 w-9 shrink-0 items-center justify-center text-muted"
            >
              <Icon name="more" />
            </button>
            {menuFor === p.id && (
              <div role="menu" className="absolute top-12 right-3 z-10 flex w-40 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
                <button type="button" role="menuitem" onClick={() => onRename(p)} className="flex h-11 items-center gap-2 px-3 text-left text-sm">
                  <Icon name="pencil" size={18} />
                  {t("common.rename")}
                </button>
                <button type="button" role="menuitem" onClick={() => onDelete(p)} className="flex h-11 items-center gap-2 px-3 text-left text-sm text-danger">
                  <Icon name="trash" size={18} />
                  {t("common.delete")}
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
      </>
      )}

      <div className="border-t border-border px-5 pt-4 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={onNew}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-[17px] font-bold text-on-accent"
        >
          <Icon name="plus" />
          {t("projects.new")}
        </button>
      </div>
    </main>
  );
}
