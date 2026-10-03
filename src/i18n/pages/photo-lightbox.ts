import { bilingual } from "@/i18n/config";

/** Words in the photo lightbox on a project page (client component, so its own small module). */
export const PHOTO_LIGHTBOX = bilingual(
  {
    open: (n: number, total: number, alt: string): string => `Open photo ${n} of ${total}: ${alt}`,
    cover: "Cover",
    close: "Close gallery",
    prev: "Previous photo",
    next: "Next photo",
    swipe: "Swipe to browse",
  },
  {
    open: (n: number, total: number, alt: string): string => `Abrir la foto ${n} de ${total}: ${alt}`,
    cover: "Portada",
    close: "Cerrar galería",
    prev: "Foto anterior",
    next: "Foto siguiente",
    swipe: "Desliza para ver más",
  },
);
