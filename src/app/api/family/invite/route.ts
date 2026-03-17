import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.familyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const family = await prisma.family.findUnique({
    where: { id: session.user.familyId },
    select: { inviteCode: true },
  });
  if (!family?.inviteCode) {
    return NextResponse.json({ error: 'No invite code' }, { status: 404 });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const inviteUrl = `${baseUrl}/register?invite=${family.inviteCode}`;
  return NextResponse.json({ inviteCode: family.inviteCode, inviteUrl });
}
