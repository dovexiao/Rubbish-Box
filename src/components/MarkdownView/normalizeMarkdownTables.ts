function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.includes('|', 1);
}

function trimTrailingEmptyTableCells(line: string): string {
  const trimmed = line.trim();
  if (!isTableRow(trimmed)) {
    return line;
  }

  const inner = trimmed.replace(/^\|/, '').replace(/\|$/, '');
  const cells = inner.split('|').map(cell => cell.trim());

  while (cells.length > 0 && cells[cells.length - 1] === '') {
    cells.pop();
  }

  if (cells.length === 0) {
    return line;
  }

  return `| ${cells.join(' | ')} |`;
}

/** 去掉 markdown 表格每行末尾因多余 | 产生的空列 */
export function normalizeMarkdownTables(markdown: string): string {
  if (!markdown.includes('|')) {
    return markdown;
  }

  return markdown
    .split('\n')
    .map(line => trimTrailingEmptyTableCells(line))
    .join('\n');
}
