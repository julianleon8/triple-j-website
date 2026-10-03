import { bilingual } from "@/i18n/config";

/**
 * Words inside the comparison sections shared by /alternatives/[slug] and the
 * local roundup (ComparisonTable). The status labels, the column badges and
 * the RelatedComparisons tiles live in SHARED (src/i18n/copy/shared.ts).
 * The claims stay as strong as the English: the table is only what each
 * company's public materials show, never a statement that a competitor lacks
 * something (Locked Decisions → Positioning).
 */
export const COMPARISON_SECTIONS = bilingual(
  {
    table: {
      feature: "Feature",
      disclaimer:
        "Comparison based on each company’s public website information as of the date below. Where a competitor’s public materials don’t document a feature, the cell shows “—” (unknown). We update this comparison quarterly or when competitors ship significant changes. Sources cited above link to each company’s public site.",
      report: "Spot something inaccurate? Let us know.",
    },
  },
  {
    table: {
      feature: "Característica",
      disclaimer:
        "Comparación basada en la información del sitio web público de cada empresa a la fecha indicada abajo. Cuando los materiales públicos de un competidor no documentan una característica, la celda muestra “—” (sin datos). Actualizamos esta comparación cada trimestre o cuando los competidores hacen cambios importantes. Las fuentes citadas arriba enlazan al sitio público de cada empresa.",
      report: "¿Notas algo inexacto? Avísanos.",
    },
  },
);
