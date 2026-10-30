import type { Metadata } from "next";
import { BoothLab } from "@/components/labs/BoothLab";
import { buildBoothMetadata } from "@/booth/meta";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ r?: string | string[] }>;
}): Promise<Metadata> {
  const { r } = await searchParams;
  return buildBoothMetadata(r, { defaultTitle: "Booth lab — IG Layout", robots: { index: false } });
}

export default function Page() {
  return <BoothLab />;
}
