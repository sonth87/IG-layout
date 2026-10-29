import type { Metadata } from "next";
import { TagLab } from "@/components/labs/TagLab";

export const metadata: Metadata = { title: "Tag lab — IG Layout", robots: { index: false } };

export default function Page() {
  return <TagLab />;
}
