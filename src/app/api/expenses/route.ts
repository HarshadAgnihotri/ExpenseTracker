import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { expenseSchema, EXPENSE_TYPE } from '@/lib/validations';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const category = searchParams.get('category');
  const account = searchParams.get('account');

  const where: { familyId: string; time?: { gte?: Date; lte?: Date }; category?: string; account?: string } = {
    familyId: session.user.familyId,
  };
  if (from) where.time = { ...where.time, gte: new Date(from) };
  if (to) where.time = { ...where.time, lte: new Date(to) };
  if (category) where.category = category;
  if (account) where.account = account;

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { time: 'desc' },
  });
  return NextResponse.json(expenses);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = expenseSchema.safeParse({
    ...body,
    type: EXPENSE_TYPE,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const expense = await prisma.expense.create({
    data: {
      familyId: session.user.familyId,
      time: parsed.data.time,
      type: parsed.data.type,
      amount: parsed.data.amount,
      category: parsed.data.category,
      account: parsed.data.account,
      notes: parsed.data.notes ?? '',
    },
  });
  return NextResponse.json(expense);
}
