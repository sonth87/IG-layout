import type { Metadata } from "next";
import { FilterLab } from "@/components/labs/FilterLab";

export const metadata: Metadata = { title: "Filter lab — IG Layout", robots: { index: false } };

export default function Page() {
  return <FilterLab />;
}
