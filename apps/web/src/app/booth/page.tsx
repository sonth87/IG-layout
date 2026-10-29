import type { Metadata } from "next";
import { Booth } from "@/booth/Booth";

export const metadata: Metadata = { title: "Photobooth — IG Layout", description: "A photobooth in your browser: pick a frame, strike a pose, save the strip." };

export default function Page() {
  return <Booth />;
}
