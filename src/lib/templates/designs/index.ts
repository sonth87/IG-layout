import type { Template, TemplateCategory } from "../types";
import { AUTUMN } from "./autumn";
import { CLASSIC } from "./classic";
import { COLLAGE } from "./collage";
import { CUTOUT } from "./cutout";
import { EDITORIAL } from "./editorial";
import { EVERYDAY } from "./everyday";
import { FILM } from "./film";
import { GRIDS } from "./grids";
import { OCCASION } from "./occasion";
import { SCRAPBOOK } from "./scrapbook";
import { SEAMLESS } from "./seamless";
import { SIMPLE } from "./simple";
import { TRAVEL } from "./travel";
import { DOODLE } from "./doodle";
import { EXTRAS } from "./extras";
import { HOLIDAYS } from "./holidays";
import { JOURNAL } from "./journal";
import { LOVE } from "./love";
import { MINIMAL } from "./minimal";
import { MOMENTS } from "./moments";
import { RETRO } from "./retro";
import { TEEN } from "./teen";
import { TET } from "./tet";
import { TORN } from "./torn";
import { WINTER } from "./winter";

// Designed templates for the home library (M10, like SCRL's template library), one file
// per kind. Newer designs first within a group.

export const DESIGNS: Template[] = [
  ...AUTUMN,
  ...MOMENTS,
  ...WINTER,
  ...TET,
  ...HOLIDAYS,
  ...CUTOUT,
  ...TORN,
  ...DOODLE,
  ...TEEN,
  ...LOVE,
  ...RETRO,
  ...EXTRAS,
  ...EVERYDAY,
  ...TRAVEL,
  ...FILM,
  ...EDITORIAL,
  ...JOURNAL,
  ...SCRAPBOOK,
  ...SEAMLESS,
  ...OCCASION,
  ...COLLAGE,
  ...MINIMAL,
  ...GRIDS,
  ...SIMPLE,
  ...CLASSIC,
];

export function designsFor(category: TemplateCategory | "all") {
  return category === "all" ? DESIGNS : DESIGNS.filter((d) => d.design?.category === category);
}

export function findDesign(id: string) {
  return DESIGNS.find((d) => d.id === id);
}

/** Every template, groups taking turns, so "Explore more" mixes kinds instead of listing group by group. */
export const MIXED: Template[] = (() => {
  const queues = new Map<string, Template[]>();
  for (const d of DESIGNS) {
    const c = d.design?.category ?? "";
    queues.set(c, [...(queues.get(c) ?? []), d]);
  }
  const out: Template[] = [];
  while (out.length < DESIGNS.length) for (const q of queues.values()) if (q.length) out.push(q.shift()!);
  return out;
})();
