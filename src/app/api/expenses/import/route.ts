import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseCsv, parseAllRows } from '@/lib/csv';
import { EXPENSE_TYPE } from '@/lib/validations';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const confirm = formData.get('confirm') === 'true';

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const text = await file.text();
  const { data: rows, errors: parseErrors } = parseCsv(text);

  if (parseErrors.length) {
    return NextResponse.json(
      { error: 'CSV validation failed', parseErrors },
      { status: 400 }
    );
  }

  const { valid, errors: rowErrors } = parseAllRows(rows);

  if (!confirm) {
    return NextResponse.json({
      preview: true,
      validCount: valid.length,
      errorCount: rowErrors.length,
      rowErrors: rowErrors.slice(0, 50),
      sample: valid.slice(0, 10),
    });
  }

  if (rowErrors.length > 0) {
    return NextResponse.json(
      {
        error: 'Fix row errors before importing',
        rowErrors,
      },
      { status: 400 }
    );
  }

  const familyId = session.user.familyId;
  await prisma.expense.createMany({
    data: valid.map((r) => ({
      familyId,
      time: r.time,
      type: r.type ?? EXPENSE_TYPE,
      amount: r.amount,
      category: r.category,
      account: r.account,
      notes: r.notes ?? '',
    })),
  });

  return NextResponse.json({ ok: true, imported: valid.length });
}
