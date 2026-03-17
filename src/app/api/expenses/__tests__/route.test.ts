/**
 * API route tests - require auth and DB. These are integration-style;
 * run with a test DB or mock Prisma. For CI we run unit tests (csv) only
 * unless DATABASE_URL is set.
 */
import { validateHeaders, parseCsv, parseAllRows } from '@/lib/csv';

const VALID_HEADERS = 'TIME,TYPE,AMOUNT,CATEGORY,ACCOUNT,NOTES';

describe('CSV contract for API', () => {
  it('export headers match required format', () => {
    const headers = VALID_HEADERS.split(',');
    expect(validateHeaders(headers)).toBe(true);
  });

  it('full round-trip CSV parse', () => {
    const csv = `${VALID_HEADERS}\nMar 01, 2025 9:45 AM,(-) Expense,99.99,Groceries,Savings,Weekly shop`;
    const { data, errors } = parseCsv(csv);
    expect(errors).toHaveLength(0);
    const { valid, errors: rowErrors } = parseAllRows(data);
    expect(rowErrors).toHaveLength(0);
    expect(valid).toHaveLength(1);
    expect(valid[0]).toMatchObject({
      amount: 99.99,
      category: 'Groceries',
      account: 'Savings',
      notes: 'Weekly shop',
    });
  });
});
