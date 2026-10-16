"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { registerServiceWorker } from "@/lib/pwa";
import { startAutosave } from "@/store/autosave";
import { useEditor } from "@/store/editor";
import { Editor } from "./editor/Editor";
import { NewProject } from "./NewProject";
import { type HomeTab, ProjectsScreen } from "./ProjectsScreen";
import { Onboarding, useOnboarding } from "./home/Onboarding";
import { translate, useSettings } from "@/store/settings";
import { HelpScreen } from "./HelpScreen";
import { SettingsScreen } from "./SettingsScreen";

type View = "projects" | "new" | "settings" | "help";

export function App() {
  const hasProject = useEditor((s) => s.doc !== null);
  const [view, setView] = useState<View>("projects");
  const [tab, setTab] = useState<HomeTab>("projects");
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
    return startAutosave();
  }, []);

  if (!isClient) return null;

  if (hasProject) return <Editor onClose={() => setView("projects")} />;
  if (view === "new") return <NewProject onClose={() => setView("projects")} />;
  if (view === "settings") return <SettingsScreen onBack={() => setView("projects")} />;
  if (view === "help") return <HelpScreen onBack={() => setView("projects")} />;
  return (
    <>
      <ProjectsScreen
        tab={tab}
        onTab={setTab}
        onNew={() => setView("new")}
        onUseTemplate={(tpl) => {
          const { locale } = useSettings.getState();
          void createFromTemplate(tpl, tpl.name[locale] || translate(locale, "library.untitled"));
        }}
        onSettings={() => setView("settings")}
        onHelp={() => setView("help")}
      />
      {onboarding.show && (
        <Onboarding
          onDone={(next) => {
            onboarding.done();
            if (next === "templates") setTab("templates");
          }}
        />
      )}
    </>
  );
}
