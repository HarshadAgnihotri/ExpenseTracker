'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { format, startOfMonth, parseISO } from 'date-fns';

type Expense = {
  id: string;
  time: string;
  amount: number;
  category: string;
  account: string;
};

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

const RADIAN = Math.PI / 180;
const LABEL_OFFSET = 28;

function renderByCategoryLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
  percent,
  index,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  name: string;
  percent: number;
  index: number;
}) {
  if (index >= 5) return null;
  const r = outerRadius + LABEL_OFFSET;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  const textAnchor = x >= cx ? 'start' : 'end';
  const fill = COLORS[index % COLORS.length];
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      dominantBaseline="central"
      fill={fill}
      className="text-xs font-medium"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function useIsSmallViewport(maxWidth = 768) {
  const [isSmall, setIsSmall] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const update = () => setIsSmall(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [maxWidth]);
  return isSmall;
}

export function DashboardCharts({ expenses }: { expenses: Expense[] }) {
  const isSmallViewport = useIsSmallViewport(768);
  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [expenses]);

  const byAccount = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => {
      map.set(e.account, (map.get(e.account) ?? 0) + e.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const byCategoryPie = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const monthly = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => {
      const key = format(new Date(e.time), 'yyyy-MM');
      map.set(key, (map.get(key) ?? 0) + e.amount);
    });
    return Array.from(map.entries())
      .map(([month, value]) => ({
        month: format(startOfMonth(parseISO(month + '-01')), 'MMM yyyy'),
        amount: value,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [expenses]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-8">
      <div className="card">
        <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Total expenses</h2>
        <p className="text-2xl font-bold text-primary-600">
          ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {monthly.length > 0 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Monthly trend
          </h2>
          <div className="h-56 min-h-[200px] sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {byCategory.length > 0 && (
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Top categories
            </h2>
            <div className="h-56 min-h-[200px] sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" tickFormatter={(v) => `₹${v}`} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Amount']} />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {byAccount.length > 0 && (
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              By account
            </h2>
            <div className="w-full min-h-[260px] sm:min-h-[380px]">
              <ResponsiveContainer
                width="100%"
                height={isSmallViewport ? 260 : 380}
              >
                <PieChart
                  margin={
                    isSmallViewport
                      ? { top: 44, right: 16, bottom: 20, left: 16 }
                      : { top: 112, right: 24, bottom: 72, left: 24 }
                  }
                >
                  <Pie
                    data={byAccount}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy={isSmallViewport ? '50%' : '54%'}
                    outerRadius={isSmallViewport ? 72 : 80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {byAccount.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Amount']} />
                  {!isSmallViewport && (
                    <Legend
                      verticalAlign="bottom"
                      wrapperStyle={{ paddingTop: 40 }}
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>
              {isSmallViewport && (
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-4">
                  {byAccount.map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                      <span
                        className="shrink-0 rounded-sm w-3 h-3"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-gray-700 dark:text-gray-300">{entry.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {byCategoryPie.length > 0 && (
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              By category
            </h2>
            <div className="w-full min-h-[440px] sm:min-h-[440px]">
              <ResponsiveContainer
                width="100%"
                height={isSmallViewport ? 320 : 440}
              >
                <PieChart
                  margin={
                    isSmallViewport
                      ? { top: 56, right: 16, bottom: 28, left: 16 }
                      : { top: 100, right: 32, bottom: 128, left: 32 }
                  }
                >
                  <Pie
                    data={byCategoryPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy={isSmallViewport ? '50%' : '42%'}
                    outerRadius={isSmallViewport ? 60 : 58}
                    paddingAngle={1}
                    label={renderByCategoryLabel}
                    labelLine={((props: { index?: number }) => (props.index ?? 0) < 5) as never}
                  >
                    {byCategoryPie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Amount']} />
                  {!isSmallViewport && (
                    <Legend
                      layout="horizontal"
                      align="center"
                      verticalAlign="bottom"
                      wrapperStyle={{
                        paddingTop: 56,
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        maxWidth: '100%',
                      }}
                      formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>}
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>
              {/* On small viewports, legend is below the chart so it never overlaps */}
              {isSmallViewport && (
                <div
                  className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-6"
                  style={{ minHeight: 0 }}
                >
                  {byCategoryPie.map((entry, i) => (
                    <div
                      key={entry.name}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <span
                        className="shrink-0 rounded-sm w-3 h-3"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-gray-700 dark:text-gray-300">{entry.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {expenses.length === 0 && (
        <div className="card text-center text-gray-500 dark:text-gray-400">
          No expenses yet. Add an expense or import a CSV to see analytics.
        </div>
      )}
    </div>
  );
}
