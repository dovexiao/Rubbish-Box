function parseTableCells(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.includes('|', 1)) {
    return null;
  }

  const inner = trimmed.replace(/^\|/, '').replace(/\|$/, '');
  const cells = inner.split('|').map(cell => cell.trim());

  while (cells.length > 0 && cells[cells.length - 1] === '') {
    cells.pop();
  }

  return cells.length > 0 ? cells : null;
}

function isSeparatorRow(cells: string[]): boolean {
  return cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell));
}

function formatTableRow(cells: string[]): string {
  return `| ${cells.join(' | ')} |`;
}

/** 规范化 AI 返回的 markdown 表格：补齐分隔行、统一列数 */
export function normalizeMarkdownTables(markdown: string): string {
  if (!markdown.includes('|')) {
    return markdown;
  }

  const lines = markdown.split('\n');
  const result: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const firstRow = parseTableCells(lines[index]);
    if (!firstRow) {
      result.push(lines[index]);
      index += 1;
      continue;
    }

    const rows: string[][] = [];
    let cursor = index;
    while (cursor < lines.length) {
      const cells = parseTableCells(lines[cursor]);
      if (!cells) break;
      rows.push(cells);
      cursor += 1;
    }

    const maxCols = Math.max(...rows.map(row => row.length));
    const normalizedRows = rows.map(row => {
      const next = [...row];
      while (next.length < maxCols) {
        next.push('');
      }
      return next;
    });

    const hasSeparator =
      normalizedRows.length >= 2 && isSeparatorRow(normalizedRows[1]);

    if (!hasSeparator) {
      normalizedRows.splice(1, 0, Array.from({ length: maxCols }, () => '---'));
    }

    normalizedRows.forEach(row => {
      result.push(formatTableRow(row));
    });

    index = cursor;
  }

  return result.join('\n');
}
