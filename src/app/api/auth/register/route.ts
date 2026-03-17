import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
  inviteCode: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, password, name, inviteCode } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);
    let familyId: string;

    if (inviteCode?.trim()) {
      const family = await prisma.family.findUnique({ where: { inviteCode: inviteCode.trim() } });
      if (!family) {
        return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
      }
      familyId = family.id;
    } else {
      const family = await prisma.family.create({
        data: {
          name: `${name ?? email}'s Family`,
          inviteCode: randomBytes(6).toString('hex'),
        },
      });
      familyId = family.id;
    }

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name ?? null,
        familyId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
