"use server";

import prisma from "@/lib/prisma";

export async function getLatestLogs() {
  try {
    return await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { 
        user: {
          select: {
            fullName: true,
            email: true
          }
        } 
      }
    });
  } catch (error) {
    return [];
  }
}
