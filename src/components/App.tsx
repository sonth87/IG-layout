"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { registerServiceWorker } from "@/lib/pwa";
import { startAutosave } from "@/store/autosave";
import { useEditor } from "@/store/editor";
import { Editor } from "./editor/Editor";
import { NewProject } from "./NewProject";
import { ProjectsScreen } from "./ProjectsScreen";
import { SettingsScreen } from "./SettingsScreen";

type View = "projects" | "new" | "settings";

export function App() {
  const hasProject = useEditor((s) => s.doc !== null);
  const [view, setView] = useState<View>("projects");
  // Settings live in localStorage, so render only on the client to avoid a language flash.
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    registerServiceWorker();
    return startAutosave();
  }, []);

  if (!isClient) return null;

  if (hasProject) return <Editor onClose={() => setView("projects")} />;
  if (view === "new") return <NewProject onClose={() => setView("projects")} />;
  if (view === "settings") return <SettingsScreen onBack={() => setView("projects")} />;
  return <ProjectsScreen onNew={() => setView("new")} onSettings={() => setView("settings")} />;
}
