import type { Locale } from '@/i18n/config'

import { BLOG_POSTS, type BlogCategory, type BlogPost } from './blog'

/**
 * The Spanish side of each post's card and search snippet (the /es mirror,
 * 2026-10-03). Bodies live in src/app/(marketing)/blog/[slug]/posts/es/.
 * Keyed by the English slug; the Spanish URL slug is in src/i18n/routes.ts.
 * Same numbers as the English (src/i18n/parity.test.ts).
 */
type PostCopy = Pick<BlogPost, 'title' | 'metaTitle' | 'metaDescription' | 'excerpt' | 'readTime' | 'tags'>

export const BLOG_POSTS_ES: Record<string, PostCopy> = {
  'welded-vs-bolted-metal-buildings-central-texas': {
    title: 'Edificios metálicos soldados vs. atornillados en el centro de Texas: lo que revelan los datos de tormentas',
    metaTitle: 'Soldado vs. atornillado en tormentas',
    metaDescription:
      'El centro de Texas recibe ráfagas de 130+ MPH y granizo del tamaño de una pelota de béisbol. Qué significa soldado o atornillado cuando esas tormentas llegan al condado de Bell.',
    excerpt:
      'El centro de Texas recibe ráfagas de 130+ MPH y granizo del tamaño de una pelota de béisbol. Esto es lo que significa la diferencia entre una estructura soldada y una atornillada cuando esas tormentas llegan al condado de Bell.',
    readTime: '7 min de lectura',
    tags: ['Soldado', 'Atornillado', 'Resistencia al viento', 'Materiales'],
  },
  'bell-county-metal-building-permit-guide': {
    title: 'Guía de permisos para edificios metálicos en el condado de Bell: requisitos en Temple, Belton y Killeen',
    metaTitle: 'Permisos de edificios metálicos, condado de Bell',
    metaDescription:
      'Quién saca el permiso, qué tamaño lo requiere en Temple y en Killeen, cuánto cuesta y cuánto tarda. Una guía de un contratista local.',
    excerpt:
      '¿Quién saca el permiso? ¿Qué tamaño requiere permiso en Temple y en Killeen? ¿Cuánto cuesta y cuánto tarda? Una guía de un contratista local sobre los requisitos del condado de Bell.',
    readTime: '6 min de lectura',
    tags: ['Permisos', 'Condado de Bell', 'Temple', 'Killeen', 'Belton'],
  },
  'fort-cavazos-pcs-metal-carport': {
    title: 'Temporada de PCS en Fort Cavazos: cómo las familias militares consiguen una cochera metálica a tiempo',
    metaTitle: 'PCS en Fort Cavazos: cocheras a tiempo',
    metaDescription:
      'Las órdenes de PCS no esperan. Así instala Triple J Metal cocheras en tiempos militares — de la aprobación del terreno a la entrega en la misma semana.',
    excerpt:
      'Las órdenes de PCS no esperan. Nosotros tampoco. Así maneja Triple J Metal la instalación de cocheras en tiempos militares — de la aprobación del terreno a la entrega en la misma semana.',
    readTime: '5 min de lectura',
    tags: ['Militar', 'Fort Cavazos', 'PCS', 'Misma semana', 'Killeen'],
  },
  'blackland-prairie-soil-metal-building-foundation': {
    title: 'El suelo de la Blackland Prairie y los cimientos de edificios metálicos: lo que debes saber en el centro de Texas',
    metaTitle: 'Edificios metálicos en suelo Blackland Prairie',
    metaDescription:
      'El barro negro del centro de Texas se hincha, se agrieta y mueve las losas si no lo tomas en cuenta. Así diseñamos anclas y losas para este suelo.',
    excerpt:
      'El mismo barro negro que hace productiva la tierra de cultivo del centro de Texas puede levantar, agrietar y mover tu losa si no lo tomas en cuenta. Así diseñamos anclas y losas para este suelo.',
    readTime: '6 min de lectura',
    tags: ['Cimientos', 'Concreto', 'Blackland Prairie', 'Suelo', 'Anclas'],
  },
  'hoa-compliant-metal-buildings-heritage-oaks-bella-charca': {
    title: 'Edificios metálicos aprobados por la HOA en Heritage Oaks y Bella Charca: qué se permite de verdad',
    metaTitle: 'Reglas de HOA: Heritage Oaks y Bella Charca',
    metaDescription:
      'Las bodegas utilitarias comunes no pasan la revisión de la HOA en los vecindarios de lujo del centro de Texas. Qué paneles, acabados y sistemas de tornillería sí pasan.',
    excerpt:
      'Las bodegas utilitarias comunes no cumplen las normas arquitectónicas de la HOA en los vecindarios de lujo del centro de Texas. Estos son los tipos de panel, acabados y sistemas de tornillería que sí pasan la revisión.',
    readTime: '7 min de lectura',
    tags: ['HOA', 'Heritage Oaks', 'Bella Charca', 'Junta alzada', 'Lujo'],
  },
}

const CATEGORY_LABEL: Record<Locale, Record<BlogCategory, string>> = {
  en: { Guides: 'Guides', Local: 'Local', Military: 'Military', HOA: 'HOA', Materials: 'Materials' },
  es: { Guides: 'Guías', Local: 'Local', Military: 'Militar', HOA: 'HOA', Materials: 'Materiales' },
}

export function categoryLabel(category: BlogCategory, locale: Locale): string {
  return CATEGORY_LABEL[locale][category]
}

/** A post's card and snippet in the page's language. Slug and date stay the English post's. */
export function localizedPost(post: BlogPost, locale: Locale): BlogPost {
  if (locale === 'en') return post
  const es = BLOG_POSTS_ES[post.slug]
  return es ? { ...post, ...es } : post
}

export function getPost(slug: string, locale: Locale): BlogPost | undefined {
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  return post ? localizedPost(post, locale) : undefined
}
