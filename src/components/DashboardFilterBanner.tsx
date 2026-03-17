'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const FILTER_KEYS = ['from', 'to', 'category', 'account'];

export function DashboardFilterBanner() {
  const searchParams = useSearchParams();
  const hasFilters = FILTER_KEYS.some((key) => searchParams.get(key));
  if (!hasFilters) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-800 dark:bg-primary-900/20 dark:text-primary-200">
      <span>Showing filtered data (in sync with Expenses).</span>
      <Link
        href="/dashboard"
        className="font-medium underline hover:no-underline"
      >
        Clear filters
      </Link>
    </div>
  );
}
