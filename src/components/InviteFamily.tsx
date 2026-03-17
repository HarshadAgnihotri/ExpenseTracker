'use client';

import { useState, useEffect } from 'react';

export function InviteFamily() {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/family/invite')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.inviteUrl) setInviteUrl(data.inviteUrl);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !inviteUrl) return null;

  return (
    <div className="card mb-6">
      <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Invite family members
      </h2>
      <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
        Share this link so others can register and see the same expenses.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="text"
          readOnly
          value={inviteUrl}
          className="input-field flex-1 min-w-0 text-sm"
        />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(inviteUrl);
          }}
          className="btn-secondary whitespace-nowrap w-full sm:w-auto"
        >
          Copy link
        </button>
      </div>
    </div>
  );
}
