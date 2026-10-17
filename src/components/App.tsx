"use client";

import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { registerServiceWorker } from "@/lib/pwa";
import type { ProjectType } from "@/lib/project/types";
import { startAutosave } from "@/store/autosave";
import { useEditor } from "@/store/editor";
import { NewProject } from "./NewProject";
import { ProjectsScreen } from "./ProjectsScreen";
import { HomeScreen } from "./home/HomeScreen";
import { NewProjectSheet } from "./home/NewProjectSheet";
import { Onboarding, useOnboarding } from "./home/Onboarding";
import { translate, useSettings, useT } from "@/store/settings";
import { HelpScreen } from "./HelpScreen";
import { SettingsScreen } from "./SettingsScreen";

// The editor (canvas, tools, 70+ fonts' CSS) loads when a project opens, not with the home screen.
const loadEditor = () => import("./editor/Editor");
const Editor = lazy(() => loadEditor().then((m) => ({ default: m.Editor })));

export type HomeTab = "home" | "projects" | "settings";

/** Floating bottom navigation (editor-v2/03 §2.6): Home / Projects / Settings, and + apart. */
function BottomNav({ tab, onTab, onNew }: { tab: HomeTab; onTab: (t: HomeTab) => void; onNew: () => void }) {
  const t = useT();
  const tabs: [HomeTab, IconName][] = [
    ["home", "home"],
    ["projects", "folder"],
    ["settings", "settings"],
  ];
  return (
    <nav aria-label={t("nav.main")} className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex items-center justify-between px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div role="tablist" className="pointer-events-auto flex gap-1 rounded-full border border-border bg-surface/85 p-1.5 shadow-lg backdrop-blur-xl">
        {tabs.map(([key, icon]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            aria-label={t(`nav.${key}`)}
            onClick={() => onTab(key)}
            className={`flex h-12 w-14 items-center justify-center rounded-full ${tab === key ? "bg-surface-2 text-text" : "text-muted"}`}
          >
            <Icon name={icon} />
          </button>
        ))}
      </div>
      <button
        type="button"
        aria-label={t("projects.new")}
        onClick={onNew}
        className="pointer-events-auto flex h-[60px] w-[60px] items-center justify-center rounded-full bg-accent text-on-accent shadow-lg"
      >
        <Icon name="plus" size={26} />
      </button>
    </nav>
  );
}

export function App() {
  const hasProject = useEditor((s) => s.doc !== null);
  const [tab, setTab] = useState<HomeTab>("home");
  const [newSheet, setNewSheet] = useState(false);
  /** Step-by-step new project (type, slides, photos, layout); null = closed. */
  const [steps, setSteps] = useState<ProjectType | null>(null);
  const [help, setHelp] = useState(false);
  const onboarding = useOnboarding();
  const createFromTemplate = useEditor((s) => s.createFromTemplate);
  // Settings live in localStorage, so render only on the client to avoid a language flash.
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    void registerServiceWorker();
    // Fetch the editor in the background once the home screen is up, so the service
    // worker has it for offline use even if no project was opened yet.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    idle(() => void loadEditor());
    return startAutosave();
  }, []);

  if (!isClient) return null;

  if (hasProject)
    return (
      <Suspense fallback={<div className="h-dvh bg-bg" />}>
        <Editor
          onClose={() => {
            // Back from a project: land where it is listed.
            setSteps(null);
            setTab("projects");
          }}
        />
      </Suspense>
    );
  if (steps) return <NewProject initialType={steps} onClose={() => setSteps(null)} />;
  if (help) return <HelpScreen onBack={() => setHelp(false)} />;
  return (
    <>
      {tab === "home" && (
        <HomeScreen
          onNew={() => setNewSheet(true)}
          onUseTemplate={(tpl) => {
            const { locale } = useSettings.getState();
            void createFromTemplate(tpl, tpl.name[locale] || translate(locale, "library.untitled"));
          }}
        />
      )}
      {tab === "projects" && <ProjectsScreen onHelp={() => setHelp(true)} />}
      {tab === "settings" && <SettingsScreen onHelp={() => setHelp(true)} />}
      <BottomNav tab={tab} onTab={setTab} onNew={() => setNewSheet(true)} />
      {newSheet && (
        <NewProjectSheet
          onClose={() => setNewSheet(false)}
          onSteps={(type) => {
            setNewSheet(false);
            setSteps(type ?? "post");
          }}
        />
      )}
      {onboarding.show && (
        <Onboarding
          onDone={(next) => {
            onboarding.done();
            setTab(next === "templates" ? "home" : "projects");
          }}
        />
      )}
    </>
  );
}
