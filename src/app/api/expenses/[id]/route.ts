import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { expenseSchema, EXPENSE_TYPE } from '@/lib/validations';

async function getFamilyId(session: { user?: { familyId?: string } } | null) {
  return session?.user?.familyId ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const familyId = await getFamilyId(session);
  if (!familyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const expense = await prisma.expense.findFirst({
    where: { id, familyId },
  });
  if (!expense) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(expense);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const familyId = await getFamilyId(session);
  if (!familyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.expense.findFirst({
    where: { id, familyId },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const parsed = expenseSchema.partial().safeParse({ ...body, type: EXPENSE_TYPE });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      ...(parsed.data.time != null && { time: parsed.data.time }),
      ...(parsed.data.amount != null && { amount: parsed.data.amount }),
      ...(parsed.data.category != null && { category: parsed.data.category }),
      ...(parsed.data.account != null && { account: parsed.data.account }),
      ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
    },
  });
  return NextResponse.json(expense);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const familyId = await getFamilyId(session);
  if (!familyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.expense.findFirst({
    where: { id, familyId },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
