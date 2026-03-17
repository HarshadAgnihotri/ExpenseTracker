'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';

const nav = [
  { href: '/dashboard', label: 'Dashboard', preserveFilters: true },
  { href: '/expenses', label: 'Expenses', preserveFilters: true },
  { href: '/expenses/new', label: 'Add expense', preserveFilters: false },
  { href: '/import', label: 'Import CSV', preserveFilters: false },
  { href: '/export', label: 'Export CSV', preserveFilters: false },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterQuery = searchParams.toString();
  const querySuffix = filterQuery ? `?${filterQuery}` : '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  }

  function navLink(href: string, label: string, preserveFilters: boolean) {
    const to = preserveFilters ? `${href}${querySuffix}` : href;
    return (
      <Link
        href={to}
        onClick={() => setMobileMenuOpen(false)}
        className={`block rounded-lg px-4 py-3 text-sm font-medium min-h-[44px] flex items-center ${
          pathname === href
            ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
        }`}
      >
        {label}
      </Link>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 safe-area-top">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
          <Link
            href="/dashboard"
            className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg shrink-0"
          >
            Family Expense Logger
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex flex-wrap items-center gap-1">
            {nav.map(({ href, label, preserveFilters }) => (
              <Link
                key={href}
                href={preserveFilters ? `${href}${querySuffix}` : href}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === href
                    ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              Sign out
            </button>
          </nav>

          {/* Mobile: hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="rounded-lg p-2.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-10 bg-black/20 md:hidden"
              aria-hidden
              onClick={() => setMobileMenuOpen(false)}
            />
            <nav
              className="absolute left-0 right-0 top-full z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 md:hidden"
              aria-label="Mobile menu"
            >
              <div className="mx-auto max-w-6xl px-2 py-2">
                {nav.map(({ href, label, preserveFilters }) => (
                  <div key={href}>{navLink(href, label, preserveFilters)}</div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 min-h-[44px] flex items-center"
                >
                  Sign out
                </button>
              </div>
            </nav>
          </>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6 pb-[env(safe-area-inset-bottom)]">{children}</main>
    </div>
  );
}
