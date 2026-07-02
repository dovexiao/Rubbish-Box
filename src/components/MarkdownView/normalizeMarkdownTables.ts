import { fontSize, px } from '@/utils/ui';

const TABLE_CELL_PADDING = px(12);
const TABLE_MIN_COL_WIDTH = px(72);
const TABLE_MAX_COL_WIDTH = px(220);

export interface MarkdownTableLayout {
  columnWidths: number[];
  tableWidth: number;
}

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

function estimateCellContentWidth(text: string): number {
  let units = 0;

  for (const char of text.trim()) {
    units += char.charCodeAt(0) > 255 ? 1 : 0.55;
  }

  return Math.ceil(units * fontSize(14)) + TABLE_CELL_PADDING;
}

function computeColumnWidths(rows: string[][]): number[] {
  const dataRows = rows.filter(row => !isSeparatorRow(row));
  const colCount = Math.max(...dataRows.map(row => row.length), 0);

  if (colCount === 0) {
    return [];
  }

  const widths = Array.from({ length: colCount }, () => TABLE_MIN_COL_WIDTH);

  dataRows.forEach(row => {
    row.forEach((cell, index) => {
      widths[index] = Math.min(
        TABLE_MAX_COL_WIDTH,
        Math.max(widths[index], estimateCellContentWidth(cell)),
      );
    });
  });

  return widths;
}

function collectTableRows(lines: string[], startIndex: number) {
  const rows: string[][] = [];
  let cursor = startIndex;

  while (cursor < lines.length) {
    const cells = parseTableCells(lines[cursor]);
    if (!cells) {
      break;
    }
    rows.push(cells);
    cursor += 1;
  }

  return { rows, nextIndex: cursor };
}

/** 提取 markdown 中每个表格的列宽，供渲染时对齐各列 */
export function extractTableLayouts(markdown: string): MarkdownTableLayout[] {
  if (!markdown.includes('|')) {
    return [];
  }

  const lines = markdown.split('\n');
  const layouts: MarkdownTableLayout[] = [];
  let index = 0;

  while (index < lines.length) {
    const firstRow = parseTableCells(lines[index]);
    if (!firstRow) {
      index += 1;
      continue;
    }

    const { rows, nextIndex } = collectTableRows(lines, index);
    const maxCols = Math.max(...rows.map(row => row.length));
    const normalizedRows = rows.map(row => {
      const next = [...row];
      while (next.length < maxCols) {
        next.push('');
      }
      return next;
    });

    const columnWidths = computeColumnWidths(normalizedRows);
    layouts.push({
      columnWidths,
      tableWidth: columnWidths.reduce((sum, width) => sum + width, 0),
    });

    index = nextIndex;
  }

  return layouts;
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

    const { rows, nextIndex: cursor } = collectTableRows(lines, index);

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
