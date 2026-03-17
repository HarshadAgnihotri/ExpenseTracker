'use client';

import { useState } from 'react';

export default function ExportPage() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch('/api/expenses/export');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'expenses.csv';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Export CSV</h1>
      <div className="card max-w-lg">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Download all your family expenses as a CSV with headers: TIME, TYPE, AMOUNT, CATEGORY, ACCOUNT, NOTES.
          TIME is in the format &quot;MMM DD, YYYY h:mm AM/PM&quot; so you can re-import the file later.
        </p>
        <button
          type="button"
          onClick={handleExport}
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Preparing…' : 'Download expenses.csv'}
        </button>
      </div>
    </div>
  );
}
