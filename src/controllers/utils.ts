function interpolateNumber(from, to, factor) {
  if (from === to) {
    return to;
  }
  return from + (to - from) * factor;
}

function interpolatorPoint(fromArray, i, to, factor) {
  const from = fromArray[i] || fromArray[i - 1] || fromArray._source;
  if (!from) {
    return to;
  }
  const x = interpolateNumber(from.x, to.x, factor);
  const y = interpolateNumber(from.y, to.y, factor);
  const angle = Number.isNaN(from.angle) ? interpolateNumber(from.angle, to.angle, factor) : undefined;
  return { x, y, angle };
}

export function interpolatePoints(from, to, factor) {
  if (Array.isArray(from) && Array.isArray(to) && to.length > 0) {
    return to.map((t, i) => interpolatorPoint(from, i, t, factor));
  }
  return to;
}
