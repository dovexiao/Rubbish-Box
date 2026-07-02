export interface JsonCodeBlock {
  raw: string;
  value: unknown;
  start: number;
  end: number;
  closed: boolean;
}

const JSON_FENCE_OPEN_PATTERN = /```[\t ]*(?:json\b[\t ]*(?:\r?\n|(?=[{[]))|\r?\n)/gi;
const JSON_FENCE_CLOSE_PATTERN = /```[\t ]*(?=\r?\n|$)/g;

const tryParseJson = (raw: string): unknown | undefined => {
  const source = raw.trim();
  if (!source) return undefined;

  try {
    return JSON.parse(source) as unknown;
  } catch {
    return undefined;
  }
};

export const findJsonCodeBlocks = (markdown: string): JsonCodeBlock[] => {
  if (!markdown) return [];

  JSON_FENCE_OPEN_PATTERN.lastIndex = 0;
  JSON_FENCE_CLOSE_PATTERN.lastIndex = 0;

  const results: JsonCodeBlock[] = [];
  const seenRanges = new Set<string>();
  let openMatch = JSON_FENCE_OPEN_PATTERN.exec(markdown);

  while (openMatch) {
    const contentStart = openMatch.index + openMatch[0].length;
    JSON_FENCE_CLOSE_PATTERN.lastIndex = contentStart;
    const closeMatch = JSON_FENCE_CLOSE_PATTERN.exec(markdown);
    const closed = Boolean(closeMatch);
    const contentEnd = closeMatch ? closeMatch.index : markdown.length;
    const blockEnd = closeMatch
      ? closeMatch.index + closeMatch[0].length
      : markdown.length;
    const raw = markdown.slice(contentStart, contentEnd).trim();
    const value = tryParseJson(raw);

    if (value !== undefined) {
      const rangeKey = `${openMatch.index}:${blockEnd}`;
      if (!seenRanges.has(rangeKey)) {
        seenRanges.add(rangeKey);
        results.push({
          raw,
          value,
          start: openMatch.index,
          end: blockEnd,
          closed,
        });
      }
    }

    JSON_FENCE_OPEN_PATTERN.lastIndex = closed ? blockEnd : markdown.length;
    openMatch = JSON_FENCE_OPEN_PATTERN.exec(markdown);
  }

  return results;
};
