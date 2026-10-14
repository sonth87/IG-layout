"use client";

import { useEditor } from "@/store/editor";
import { Editor } from "./editor/Editor";
import { NewProject } from "./NewProject";

export function App() {
  const hasProject = useEditor((s) => s.doc !== null);
  return hasProject ? <Editor /> : <NewProject />;
}
