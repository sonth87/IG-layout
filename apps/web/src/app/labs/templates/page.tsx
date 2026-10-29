import type { Metadata } from "next";
import { TemplateLab } from "@/components/labs/TemplateLab";

export const metadata: Metadata = { title: "Template lab — IG Layout", robots: { index: false } };

export default function Page() {
  return <TemplateLab />;
}
