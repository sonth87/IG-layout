import type { Metadata } from "next";
import { LivePhotoLab } from "@/booth/LivePhotoLab";

export const metadata: Metadata = { title: "Live Photo lab — IG Layout", robots: { index: false } };

export default function Page() {
  return <LivePhotoLab />;
}
