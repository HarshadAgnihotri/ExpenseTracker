'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ACCOUNT_VALUES, type ExpenseInput } from '@/lib/validations';

type Expense = {
  id: string;
  time: string;
  amount: number;
  category: string;
  account: string;
  notes: string | null;
};

export function ExpenseForm({
  expense,
  mode,
}: {
  expense?: Expense | null;
  mode: 'create' | 'edit';
}) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const defaultTime = expense
    ? format(new Date(expense.time), "yyyy-MM-dd'T'HH:mm")
    : format(new Date(), "yyyy-MM-dd'T'HH:mm");
  const [time, setTime] = useState(defaultTime);
  const [amount, setAmount] = useState(expense?.amount?.toString() ?? '');
  const [category, setCategory] = useState(expense?.category ?? '');
  const [account, setAccount] = useState(expense?.account ?? 'Card');
  const [notes, setNotes] = useState(expense?.notes ?? '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload: ExpenseInput = {
      time: new Date(time),
      type: '(-) Expense',
      amount: Number.parseFloat(amount),
      category: category.trim(),
      account: account as ExpenseInput['account'],
      notes: notes.trim(),
    };
    if (Number.isNaN(payload.amount) || payload.amount <= 0) {
      setError('Amount must be a positive number');
      setLoading(false);
      return;
    }
    if (!payload.category) {
      setError('Category is required');
      setLoading(false);
      return;
    }
    if (!ACCOUNT_VALUES.includes(payload.account)) {
      setError('Account must be Savings, Card, or Cash');
      setLoading(false);
      return;
    }

    try {
      const url = mode === 'edit' && expense ? `/api/expenses/${expense.id}` : '/api/expenses';
      const method = mode === 'edit' ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Request failed');
        setLoading(false);
        return;
      }
      router.push('/expenses');
      router.refresh();
    } catch {
      setError('Request failed');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-lg space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="time" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Time
        </label>
        <input
          id="time"
          type="datetime-local"
          required
          className="input-field"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="amount" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Amount (INR)
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          className="input-field"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <input
          id="category"
          type="text"
          required
          className="input-field"
          placeholder="e.g. Food, Transport"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="account" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Account
        </label>
        <select
          id="account"
          required
          className="input-field"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
        >
          {ACCOUNT_VALUES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Notes (optional)
        </label>
        <input
          id="notes"
          type="text"
          className="input-field"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : mode === 'edit' ? 'Update' : 'Add expense'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
