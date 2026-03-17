import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ExpenseForm } from '@/components/ExpenseForm';

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.familyId) notFound();

  const { id } = await params;
  const expense = await prisma.expense.findFirst({
    where: { id, familyId: session.user.familyId },
  });
  if (!expense) notFound();

  return (
    <div>
      <h1 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Edit expense</h1>
      <ExpenseForm expense={expense} mode="edit" />
    </div>
  );
}
