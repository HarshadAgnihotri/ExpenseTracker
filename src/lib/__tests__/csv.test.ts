import {
  validateHeaders,
  parseCsv,
  parseRow,
  parseAllRows,
  type CsvRow,
} from '../csv';

const VALID_HEADERS = 'TIME,TYPE,AMOUNT,CATEGORY,ACCOUNT,NOTES';

describe('validateHeaders', () => {
  it('accepts exact headers in order', () => {
    expect(validateHeaders(['TIME', 'TYPE', 'AMOUNT', 'CATEGORY', 'ACCOUNT', 'NOTES'])).toBe(true);
  });

  it('rejects wrong order', () => {
    expect(validateHeaders(['AMOUNT', 'TIME', 'TYPE', 'CATEGORY', 'ACCOUNT', 'NOTES'])).toBe(false);
  });

  it('rejects missing columns', () => {
    expect(validateHeaders(['TIME', 'TYPE', 'AMOUNT'])).toBe(false);
  });

  it('rejects extra columns', () => {
    expect(validateHeaders(['TIME', 'TYPE', 'AMOUNT', 'CATEGORY', 'ACCOUNT', 'NOTES', 'EXTRA'])).toBe(false);
  });
});

describe('parseCsv', () => {
  it('parses valid CSV and returns no parse errors', () => {
    const csv = `${VALID_HEADERS}\nMar 01, 2025 9:45 AM,(-) Expense,100,Food,Card,`;
    const { data, errors } = parseCsv(csv);
    expect(errors).toHaveLength(0);
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({ TIME: 'Mar 01, 2025 9:45 AM', TYPE: '(-) Expense', AMOUNT: '100', CATEGORY: 'Food', ACCOUNT: 'Card' });
  });

  it('reports invalid headers', () => {
    const csv = `TIME,AMOUNT,CATEGORY\nMar 01, 2025 9:45 AM,100,Food`;
    const { errors } = parseCsv(csv);
    expect(errors.some((e) => e.includes('Invalid headers'))).toBe(true);
  });
});

describe('parseRow', () => {
  it('parses valid row', () => {
    const row: CsvRow = {
      TIME: 'Mar 01, 2025 9:45 AM',
      TYPE: '(-) Expense',
      AMOUNT: '250.50',
      CATEGORY: 'Transport',
      ACCOUNT: 'Cash',
      NOTES: 'Cab',
    };
    const out = parseRow(row, 0);
    expect('ok' in out).toBe(true);
    if ('ok' in out) {
      expect(out.ok.amount).toBe(250.5);
      expect(out.ok.category).toBe('Transport');
      expect(out.ok.account).toBe('Cash');
      expect(out.ok.notes).toBe('Cab');
    }
  });

  it('rejects invalid TYPE', () => {
    const row: CsvRow = {
      TIME: 'Mar 01, 2025 9:45 AM',
      TYPE: 'Income',
      AMOUNT: '100',
      CATEGORY: 'Food',
      ACCOUNT: 'Card',
      NOTES: '',
    };
    const out = parseRow(row, 0);
    expect('error' in out).toBe(true);
    if ('error' in out) expect(out.error.message).toContain('TYPE');
  });

  it('rejects invalid ACCOUNT', () => {
    const row: CsvRow = {
      TIME: 'Mar 01, 2025 9:45 AM',
      TYPE: '(-) Expense',
      AMOUNT: '100',
      CATEGORY: 'Food',
      ACCOUNT: 'Bitcoin',
      NOTES: '',
    };
    const out = parseRow(row, 0);
    expect('error' in out).toBe(true);
    if ('error' in out) expect(out.error.message).toContain('ACCOUNT');
  });

  it('rejects non-positive AMOUNT', () => {
    const row: CsvRow = {
      TIME: 'Mar 01, 2025 9:45 AM',
      TYPE: '(-) Expense',
      AMOUNT: '0',
      CATEGORY: 'Food',
      ACCOUNT: 'Card',
      NOTES: '',
    };
    const out = parseRow(row, 0);
    expect('error' in out).toBe(true);
  });

  it('rejects empty CATEGORY', () => {
    const row: CsvRow = {
      TIME: 'Mar 01, 2025 9:45 AM',
      TYPE: '(-) Expense',
      AMOUNT: '100',
      CATEGORY: '',
      ACCOUNT: 'Savings',
      NOTES: '',
    };
    const out = parseRow(row, 0);
    expect('error' in out).toBe(true);
  });
});

describe('parseAllRows', () => {
  it('splits valid and invalid rows', () => {
    const rows: CsvRow[] = [
      {
        TIME: 'Mar 01, 2025 9:45 AM',
        TYPE: '(-) Expense',
        AMOUNT: '100',
        CATEGORY: 'Food',
        ACCOUNT: 'Card',
        NOTES: '',
      },
      {
        TIME: 'Mar 02, 2025',
        TYPE: '(-) Expense',
        AMOUNT: '50',
        CATEGORY: 'Snacks',
        ACCOUNT: 'Cash',
        NOTES: '',
      },
    ];
    const { valid, errors } = parseAllRows(rows);
    expect(valid).toHaveLength(1);
    expect(errors).toHaveLength(1);
    expect(errors[0].row).toBe(2);
  });
});
