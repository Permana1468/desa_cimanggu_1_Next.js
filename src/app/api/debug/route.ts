import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const profile = await prisma.villageProfile.findFirst();
  return NextResponse.json(profile);
}
