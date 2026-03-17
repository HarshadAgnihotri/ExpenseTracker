import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ExpenseList } from '@/components/ExpenseList';

type SearchParams = { from?: string; to?: string; category?: string; account?: string };

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.familyId) redirect('/login');

  const params = await searchParams;
  const from = params.from ? new Date(params.from) : undefined;
  const to = params.to ? new Date(params.to) : undefined;

  const where: { familyId: string; time?: { gte?: Date; lte?: Date }; category?: string; account?: string } = {
    familyId: session.user.familyId,
  };
  if (from) where.time = { ...where.time, gte: from };
  if (to) where.time = { ...where.time, lte: to };
  if (params.category) where.category = params.category;
  if (params.account) where.account = params.account;

  const [expenses, categories, accounts] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { time: 'desc' },
    }),
    prisma.expense.findMany({
      where: { familyId: session.user.familyId },
      select: { category: true },
      distinct: ['category'],
    }),
    prisma.expense.findMany({
      where: { familyId: session.user.familyId },
      select: { account: true },
      distinct: ['account'],
    }),
  ]);

  const categoryOptions = [...new Set(categories.map((c) => c.category))].sort();
  const accountOptions = [...new Set(accounts.map((a) => a.account))].sort();

  return (
    <div>
      <h1 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
      <ExpenseList
        expenses={expenses}
        categoryOptions={categoryOptions}
        accountOptions={accountOptions}
        filters={params}
      />
    </div>
  );
}
