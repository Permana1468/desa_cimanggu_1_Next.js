"use server";

import prisma from "@/lib/prisma";

export async function getLatestLogs() {
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
}
