function interpolateNumber(from: number, to: number, factor: number) {
  if (from === to) {
    return to;
  }
  return from + (to - from) * factor;
}

function interpolatorPoint(fromArray: any, i: number, to: { x: number; y: number; angle: number }, factor: number) {
  const from = fromArray[i] || fromArray[i - 1] || fromArray._source;
  if (!from) {
    return to;
  }
  const x = interpolateNumber(from.x, to.x, factor);
  const y = interpolateNumber(from.y, to.y, factor);
  const angle = Number.isNaN(from.angle) ? interpolateNumber(from.angle, to.angle, factor) : undefined;
  return { x, y, angle };
}

export default function interpolatePoints(
  from: { x: number; y: number; angle: number }[],
  to: { x: number; y: number; angle: number }[],
  factor: number
): { x: number; y: number; angle?: number }[] {
  if (Array.isArray(from) && Array.isArray(to) && to.length > 0) {
    return to.map((t, i) => interpolatorPoint(from, i, t, factor));
  }
  return to;
}
