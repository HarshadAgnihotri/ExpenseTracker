import { z } from 'zod';

export const ACCOUNT_VALUES = ['Savings', 'Card', 'Cash'] as const;
export type AccountType = (typeof ACCOUNT_VALUES)[number];

export const EXPENSE_TYPE = '(-) Expense';

export const expenseSchema = z.object({
  time: z.coerce.date(),
  type: z.literal(EXPENSE_TYPE).default(EXPENSE_TYPE),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  account: z.enum(ACCOUNT_VALUES),
  notes: z.string().optional().default(''),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

export const csvHeaders = ['TIME', 'TYPE', 'AMOUNT', 'CATEGORY', 'ACCOUNT', 'NOTES'] as const;

export function isAccount(value: string): value is AccountType {
  return ACCOUNT_VALUES.includes(value as AccountType);
}
