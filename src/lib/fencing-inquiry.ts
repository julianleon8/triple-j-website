/** Keep fencing scope readable in the existing lead notes and owner alert. */
export function fencingNotes(form: {
  fence_style: string;
  fence_length: string;
  fence_height: string;
  fence_gates: string;
  fence_removal: string;
}): string {
  return [
    'Requested build: Metal Fencing & Gates',
    `Fence style: ${form.fence_style || 'Not sure yet'}`,
    form.fence_length ? `Fence length: ${form.fence_length} linear ft` : '',
    form.fence_height ? `Fence height: ${form.fence_height} ft` : '',
    form.fence_gates.trim() ? `Gates: ${form.fence_gates.trim()}` : '',
    `Old fence removal: ${form.fence_removal || 'Not sure'}`,
  ].filter(Boolean).join('\n');
}
