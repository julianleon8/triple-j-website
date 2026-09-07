import { describeGalleryColors, type GalleryColorInput } from './gallery-colors';

export type ReferenceService = 'carport' | 'garage' | 'barn' | 'rv_cover' | 'lean_to' | 'other';
export type ProjectReference = { id: string; title: string; city: string; type: string; image: string };

export function projectService(type: string): ReferenceService {
  const types: Record<string, ReferenceService> = {
    Carport: 'carport', Garage: 'garage', Barn: 'barn', 'RV Cover': 'rv_cover',
    'Lean-To': 'lean_to', 'Porch Cover': 'lean_to',
  };
  return types[type] ?? 'other';
}

export function referenceNotes(project: Pick<ProjectReference, 'id' | 'title' | 'city' | 'type'> & GalleryColorInput, baseUrl: string): string {
  return [
    'Project inspiration (reference only):', project.title,
    `Location: ${project.city}`, `Building type: ${project.type}`,
    describeGalleryColors(project).label,
    `${baseUrl.replace(/\/$/, '')}/gallery/${project.id}`,
  ].filter(Boolean).join('\n');
}
