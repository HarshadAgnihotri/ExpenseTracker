'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseCsv, parseAllRows } from '@/lib/csv';
import { format } from 'date-fns';

const CSV_HEADERS = 'TIME,TYPE,AMOUNT,CATEGORY,ACCOUNT,NOTES';

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [rowErrors, setRowErrors] = useState<{ row: number; message: string }[]>([]);
  const [preview, setPreview] = useState<{ validCount: number; errorCount: number; sample: Array<{ time: Date; amount: number; category: string; account: string; notes: string }> } | null>(null);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState<number | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setFile(f ?? null);
    setParseErrors([]);
    setRowErrors([]);
    setPreview(null);
    setStep('upload');
    setImportDone(null);
  }

  async function handlePreview() {
    if (!file) return;
    const text = await file.text();
    const { data: rows, errors } = parseCsv(text);
    if (errors.length) {
      setParseErrors(errors);
      setPreview(null);
      return;
    }
    const { valid, errors: re } = parseAllRows(rows);
    setRowErrors(re);
    setPreview({
      validCount: valid.length,
      errorCount: re.length,
      sample: valid.slice(0, 10),
    });
    setStep('preview');
  }

  async function handleImport() {
    if (!file) return;
    setImporting(true);
    setImportDone(null);
    const form = new FormData();
    form.set('file', file);
    form.set('confirm', 'true');
    const res = await fetch('/api/expenses/import', { method: 'POST', body: form });
    const data = await res.json().catch(() => ({}));
    setImporting(false);
    if (res.ok) {
      setImportDone(data.imported ?? 0);
      setStep('done');
      router.refresh();
    } else {
      setRowErrors(data.rowErrors ?? [{ row: 0, message: data.error ?? 'Import failed' }]);
    }
  }

  return (
    <div>
      <h1 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Import CSV</h1>
      <div className="card max-w-2xl space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          CSV must have exactly these headers (in order): <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">{CSV_HEADERS}</code>.
          TIME format: <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">Mar 01, 2025 9:45 AM</code>.
          ACCOUNT must be Savings, Card, or Cash.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full max-w-xs text-sm text-gray-500 file:mr-2 file:rounded file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-primary-700"
          />
          {step === 'upload' && (
            <button type="button" onClick={handlePreview} className="btn-primary" disabled={!file}>
              Preview
            </button>
          )}
        </div>

        {parseErrors.length > 0 && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            <ul className="list-disc pl-4">
              {parseErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {preview && step === 'preview' && (
          <>
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
              Valid rows: <strong>{preview.validCount}</strong>. Errors: <strong>{preview.errorCount}</strong>.
              {preview.errorCount > 0 && ' Fix errors in your CSV and re-upload, or import only valid rows by confirming below.'}
            </div>
            {rowErrors.length > 0 && (
              <div className="max-h-48 overflow-auto rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                <ul className="list-disc pl-4">
                  {rowErrors.slice(0, 20).map((e, i) => (
                    <li key={i}>Row {e.row}: {e.message}</li>
                  ))}
                  {rowErrors.length > 20 && <li>… and {rowErrors.length - 20} more</li>}
                </ul>
              </div>
            )}
            {preview.sample.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="pb-2 pr-2">Time</th>
                      <th className="pb-2 pr-2">Amount</th>
                      <th className="pb-2 pr-2">Category</th>
                      <th className="pb-2 pr-2">Account</th>
                      <th className="pb-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.sample.map((r, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-1 pr-2">{format(r.time, 'MMM dd, yyyy h:mm a')}</td>
                        <td className="py-1 pr-2">₹{r.amount}</td>
                        <td className="py-1 pr-2">{r.category}</td>
                        <td className="py-1 pr-2">{r.account}</td>
                        <td className="py-1">{r.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {preview.validCount > 0 && preview.errorCount === 0 && (
              <button
                type="button"
                onClick={handleImport}
                className="btn-primary"
                disabled={importing}
              >
                {importing ? 'Importing…' : `Import ${preview.validCount} rows`}
              </button>
            )}
          </>
        )}

        {step === 'done' && importDone !== null && (
          <div className="rounded-lg bg-green-50 p-3 text-green-800 dark:bg-green-900/20 dark:text-green-200">
            Imported <strong>{importDone}</strong> expenses. <a href="/expenses" className="underline">View expenses</a>.
          </div>
        )}
      </div>
    </div>
  );
}
