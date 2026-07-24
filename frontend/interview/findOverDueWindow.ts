function findOverdueWindows(
  evidenceEvents: number[],
  refreshWindow: number,
  checkDay: number
): number[][] {
  if (evidenceEvents.length === 0 || refreshWindow < 0) {
    return [];
  }

  const events = [...new Set(evidenceEvents)]
    .filter(day => day <= checkDay)
    .sort((a, b) => a - b);

  if (events.length === 0) {
    return [];
  }

  const overdue: number[][] = [];

  for (let i = 0; i < events.length - 1; i++) {
    const currentEvent = events[i];
    const nextEvent = events[i + 1];

    const validUntil = currentEvent + refreshWindow;

    if (nextEvent > validUntil) {
      overdue.push([validUntil, nextEvent]);
    }
  }

  const lastEvent = events[events.length - 1];
  const lastValidUntil = lastEvent + refreshWindow;

  if (checkDay > lastValidUntil) {
    overdue.push([lastValidUntil, checkDay]);
  }

  return overdue;
}