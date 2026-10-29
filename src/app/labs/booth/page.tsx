import type { Metadata } from "next";
import { BoothLab } from "@/components/labs/BoothLab";

export const metadata: Metadata = { title: "Booth lab — IG Layout", robots: { index: false } };

export default function Page() {
  return <BoothLab />;
}
