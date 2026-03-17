import Papa from 'papaparse';
import { parse } from 'date-fns';
import { csvHeaders, EXPENSE_TYPE, isAccount, type AccountType } from './validations';

const CSV_HEADERS = csvHeaders.slice();
const TIME_FORMAT = 'MMM dd, yyyy h:mm a';

export interface CsvRow {
  TIME: string;
  TYPE: string;
  AMOUNT: string;
  CATEGORY: string;
  ACCOUNT: string;
  NOTES: string;
}

export interface ParsedExpenseRow {
  time: Date;
  type: string;
  amount: number;
  category: string;
  account: AccountType;
  notes: string;
}

export interface RowError {
  row: number;
  message: string;
  raw: string[];
}

export function validateHeaders(headers: string[]): boolean {
  if (headers.length !== CSV_HEADERS.length) return false;
  return CSV_HEADERS.every((h, i) => (headers[i] ?? '').trim() === h);
}

export function parseCsv(content: string): { data: CsvRow[]; errors: string[] } {
  const result = Papa.parse<CsvRow>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const errors: string[] = [];
  if (result.errors.length) {
    result.errors.forEach((e) => errors.push(`Parse: ${e.message} (row ${e.row})`));
  }

  const firstRow = result.meta.fields;
  if (!firstRow || !validateHeaders(firstRow)) {
    errors.push(
      `Invalid headers. Expected exactly: ${CSV_HEADERS.join(', ')}. Got: ${firstRow?.join(', ') ?? 'none'}`
    );
  }

  return { data: result.data ?? [], errors };
}

export function parseRow(row: CsvRow, index: number): { ok: ParsedExpenseRow } | { error: RowError } {
  const raw = [row.TIME, row.TYPE, row.AMOUNT, row.CATEGORY, row.ACCOUNT, row.NOTES];
  const timeStr = (row.TIME ?? '').trim();
  const amountStr = (row.AMOUNT ?? '').trim();
  const category = (row.CATEGORY ?? '').trim();
  const account = (row.ACCOUNT ?? '').trim();
  const notes = (row.NOTES ?? '').trim();

  if (!timeStr) return { error: { row: index + 1, message: 'TIME is required', raw } };
  let time: Date;
  try {
    time = parse(timeStr, TIME_FORMAT, new Date());
    if (Number.isNaN(time.getTime())) throw new Error('Invalid date');
  } catch {
    return { error: { row: index + 1, message: `Invalid TIME format (use e.g. "Mar 01, 2025 9:45 AM")`, raw } };
  }

  const type = (row.TYPE ?? '').trim();
  if (type !== EXPENSE_TYPE) {
    return { error: { row: index + 1, message: `TYPE must be "${EXPENSE_TYPE}"`, raw } };
  }

  const amount = Number.parseFloat(amountStr);
  if (Number.isNaN(amount) || amount <= 0) {
    return { error: { row: index + 1, message: 'AMOUNT must be a positive number', raw } };
  }

  if (!category) return { error: { row: index + 1, message: 'CATEGORY is required', raw } };
  if (!isAccount(account)) {
    return { error: { row: index + 1, message: 'ACCOUNT must be Savings, Card, or Cash', raw } };
  }

  return {
    ok: {
      time,
      type: EXPENSE_TYPE,
      amount,
      category,
      account: account as AccountType,
      notes,
    },
  };
}

export function parseAllRows(rows: CsvRow[]): { valid: ParsedExpenseRow[]; errors: RowError[] } {
  const valid: ParsedExpenseRow[] = [];
  const errors: RowError[] = [];
  rows.forEach((row, i) => {
    const out = parseRow(row, i);
    if ('ok' in out) valid.push(out.ok);
    else errors.push(out.error);
  });
  return { valid, errors };
}
