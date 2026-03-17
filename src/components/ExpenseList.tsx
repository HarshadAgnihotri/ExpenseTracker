'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ACCOUNT_VALUES } from '@/lib/validations';

type Expense = {
  id: string;
  time: string;
  amount: number;
  category: string;
  account: string;
  notes: string | null;
};

export function ExpenseList({
  expenses,
  categoryOptions,
  accountOptions,
  filters,
}: {
  expenses: Expense[];
  categoryOptions: string[];
  accountOptions: string[];
  filters: { from?: string; to?: string; category?: string; account?: string };
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [from, setFrom] = useState(filters.from ?? '');
  const [to, setTo] = useState(filters.to ?? '');
  const [category, setCategory] = useState(filters.category ?? '');
  const [account, setAccount] = useState(filters.account ?? '');

  function applyFilters() {
    const p = new URLSearchParams();
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    if (category) p.set('category', category);
    if (account) p.set('account', account);
    router.push(`/expenses?${p.toString()}`);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this expense?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  const accountOpts = accountOptions.length ? accountOptions : ACCOUNT_VALUES;

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-end gap-3">
        <div className="w-full min-w-0 sm:min-w-[120px] sm:w-auto">
          <label className="mb-1 block text-xs font-medium text-gray-500">From</label>
          <input
            type="date"
            className="input-field"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="w-full min-w-0 sm:min-w-[120px] sm:w-auto">
          <label className="mb-1 block text-xs font-medium text-gray-500">To</label>
          <input
            type="date"
            className="input-field"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="w-full min-w-0 sm:min-w-[120px] sm:w-auto">
          <label className="mb-1 block text-xs font-medium text-gray-500">Category</label>
          <select
            className="input-field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full min-w-0 sm:min-w-[120px] sm:w-auto">
          <label className="mb-1 block text-xs font-medium text-gray-500">Account</label>
          <select
            className="input-field"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          >
            <option value="">All</option>
            {accountOpts.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <button type="button" onClick={applyFilters} className="btn-primary">
          Apply
        </button>
        <button
          type="button"
          onClick={() => {
            setFrom('');
            setTo('');
            setCategory('');
            setAccount('');
            router.push('/expenses');
          }}
          className="btn-secondary"
        >
          Clear filters
        </button>
      </div>

      <div className="card overflow-x-auto">
        {expenses.length === 0 ? (
          <p className="py-8 text-center text-gray-500 dark:text-gray-400">
            No expenses match. Add one or adjust filters.
          </p>
        ) : (
          <>
            {/* Mobile: card list */}
            <ul className="space-y-3 md:hidden list-none p-0 m-0">
              {expenses.map((e) => (
                <li
                  key={e.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-600 p-3 space-y-1"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-medium text-primary-600 dark:text-primary-400">
                      ₹{e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(e.time), 'MMM dd, h:mm a')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {e.category} · {e.account}
                  </div>
                  {e.notes ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{e.notes}</p>
                  ) : null}
                  <div className="flex gap-3 pt-2">
                    <Link
                      href={`/expenses/${e.id}/edit`}
                      className="text-sm font-medium text-primary-600 hover:underline min-h-[44px] flex items-center"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(e.id)}
                      disabled={deletingId === e.id}
                      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50 min-h-[44px] flex items-center"
                    >
                      {deletingId === e.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {/* Desktop: table */}
            <table className="hidden md:table w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="pb-2 pr-4 font-medium">Time</th>
                  <th className="pb-2 pr-4 font-medium">Amount</th>
                  <th className="pb-2 pr-4 font-medium">Category</th>
                  <th className="pb-2 pr-4 font-medium">Account</th>
                  <th className="pb-2 pr-4 font-medium">Notes</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {format(new Date(e.time), 'MMM dd, yyyy h:mm a')}
                    </td>
                    <td className="py-2 pr-4 font-medium">₹{e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2 pr-4">{e.category}</td>
                    <td className="py-2 pr-4">{e.account}</td>
                    <td className="max-w-[200px] truncate py-2 pr-4">{e.notes ?? '—'}</td>
                    <td className="py-2">
                      <Link
                        href={`/expenses/${e.id}/edit`}
                        className="text-primary-600 hover:underline mr-2"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(e.id)}
                        disabled={deletingId === e.id}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        {deletingId === e.id ? '…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
