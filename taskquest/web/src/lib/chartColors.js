// Fixed-order categorical slots for chart series (CSS custom properties —
// see index.css for the validated hex values per mode). Never reorder these;
// an entity keeps whichever slot it's assigned so filtering never repaints
// the survivors.
export const CHART_SLOTS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

export const CHART_OTHER = "var(--chart-other)";

// Assigns each list a stable color by its position in the (already
// position-sorted) lists array, folding anything past the 6-slot cap into
// the de-emphasis "Other" gray rather than generating a 7th hue.
export function colorForListIndex(index) {
  return CHART_SLOTS[index] ?? CHART_OTHER;
}
