import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { EXPENSE_TYPE } from '@/lib/validations';

const CSV_HEADERS = 'TIME,TYPE,AMOUNT,CATEGORY,ACCOUNT,NOTES';
const TIME_FORMAT = 'MMM dd, yyyy h:mm a';

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const expenses = await prisma.expense.findMany({
    where: { familyId: session.user.familyId },
    orderBy: { time: 'asc' },
  });

  const rows = expenses.map((e) => {
    let timeStr = format(new Date(e.time), TIME_FORMAT);
    timeStr = timeStr.replace(/\b(am|pm)\b/gi, (m) => m.toUpperCase());
    return [
      escapeCsvField(timeStr),
      escapeCsvField(EXPENSE_TYPE),
      String(e.amount),
      escapeCsvField(e.category),
      escapeCsvField(e.account),
      escapeCsvField(e.notes ?? ''),
    ].join(',');
  });

  const csv = [CSV_HEADERS, ...rows].join('\r\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="expenses.csv"',
    },
  });
}
