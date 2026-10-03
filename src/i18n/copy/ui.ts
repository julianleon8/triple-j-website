import { bilingual, type Locale } from "@/i18n/config";

/** Small interface words shared by the build strip, cards, grid and lightbox. */
export const UI = bilingual(
  {
    latestBuilds: "Latest builds",
    seeFullGallery: "See the full gallery →",
    prevBuilds: "Previous builds",
    nextBuilds: "Next builds",
    view: "View",
    close: "Close",
    prevPhoto: "Previous photo",
    nextPhoto: "Next photo",
    photoOf: (n: number, total: number) => `Photo ${n} of ${total}`,
    quoteLikeThis: "Quote a build like this",
  },
  {
    latestBuilds: "Obras recientes",
    seeFullGallery: "Ver toda la galería →",
    prevBuilds: "Obras anteriores",
    nextBuilds: "Más obras",
    view: "Ver",
    close: "Cerrar",
    prevPhoto: "Foto anterior",
    nextPhoto: "Foto siguiente",
    photoOf: (n: number, total: number) => `Foto ${n} de ${total}`,
    quoteLikeThis: "Cotizar una obra como esta",
  },
);

/**
 * Gallery `type` and `tag` values are English words stored in Supabase
 * (gallery_items). The Spanish site shows them through this table; a value
 * not listed shows as stored. Project titles are typed in HQ and show as typed.
 */
const BUILD_WORDS_ES: Record<string, string> = {
  Carport: "Cochera",
  Garage: "Garaje",
  Barn: "Granero",
  "RV Cover": "Cubierta para RV",
  "Lean-To": "Lean-to",
  "Porch Cover": "Techo de porche",
  Hybrid: "Proyecto híbrido",
  Other: "Otro",
  Fencing: "Cerca",
  Build: "Obra",
  Welded: "Soldado",
  Bolted: "Atornillado",
  Turnkey: "Llave en mano",
  "Central Texas": "Centro de Texas",
};

export function buildWord(value: string, locale: Locale): string {
  return locale === "es" ? (BUILD_WORDS_ES[value] ?? value) : value;
}
