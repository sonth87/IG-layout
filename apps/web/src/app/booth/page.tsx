import type { Metadata } from "next";
import { Booth } from "@/booth/Booth";
import { buildBoothMetadata } from "@/booth/meta";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ r?: string | string[] }>;
}): Promise<Metadata> {
  const { r } = await searchParams;
  return buildBoothMetadata(r);
}

export default function Page() {
  return <Booth />;
}
