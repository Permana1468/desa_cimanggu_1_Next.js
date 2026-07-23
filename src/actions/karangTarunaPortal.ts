"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getTenantId(): Promise<string> {
  const session = await getServerSession(authOptions);
  return session?.user?.tenantId || "default-tenant";
}

// 1. Search Warga for Karang Taruna Member Registration with Data Kependudukan Integration
export async function searchWargaForKarangTaruna(query: string) {
  const tenantId = await getTenantId();
  if (!query || query.trim().length === 0) return { results: [], promptNotice: null };

  const cleanQuery = query.trim();
  const results = await prisma.dataKependudukan.findMany({
    where: {
      tenantId,
      OR: [
        { namaLengkap: { contains: cleanQuery, mode: 'insensitive' } },
        { nik: { contains: cleanQuery } }
      ]
    },
    take: 10,
    orderBy: { namaLengkap: 'asc' }
  });

  let promptNotice = null;
  if (results.length === 0) {
    promptNotice = `Warga dengan NIK / Nama "${cleanQuery}" belum terdaftar di Data Kependudukan Desa. Silakan daftarkan data kependudukan terlebih dahulu ke Kantor Desa / Operator.`;
  }

  return { results, promptNotice };
}

// 2. Create Karang Taruna Member Account (Bendahara & Member)
export async function createKarangTarunaMemberAccount(data: {
  namaLengkap: string;
  nik?: string;
  role: "KARANG_TARUNA_BENDAHARA" | "KARANG_TARUNA_MEMBER";
  divisi?: string;
  rt?: string;
  rw?: string;
  noHp?: string;
  keahlian?: string;
  username: string;
}) {
  const tenantId = await getTenantId();

  // Create KatarMember entry
  const member = await prisma.katarMember.create({
    data: {
      tenantId,
      name: data.namaLengkap,
      role: data.role === "KARANG_TARUNA_BENDAHARA" ? "Bendahara" : `Anggota - ${data.divisi || "Umum"}`,
      rt: data.rt || null,
      rw: data.rw || null,
      phone: data.noHp || null,
      skills: data.keahlian || null,
      status: "Aktif"
    }
  });

  revalidatePath("/karang-taruna");
  revalidatePath("/dashboard");
  return { success: true, member };
}

// 3. Activity Logs / Kinerja Anggota
export async function getKarangTarunaActivityLogs() {
  const tenantId = await getTenantId();
  return await prisma.katarGallery.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" }
  });
}

export async function addKarangTarunaActivityLog(data: {
  title: string;
  category: string;
  description: string;
  memberName: string;
  fileUrl?: string;
}) {
  const tenantId = await getTenantId();

  const log = await prisma.katarGallery.create({
    data: {
      tenantId,
      fileName: data.title,
      fileUrl: data.fileUrl || "/placeholder-activity.jpg",
      type: "image",
      category: data.category || "Kegiatan Anggota",
      size: data.memberName ? `Oleh: ${data.memberName}` : "Anggota Karang Taruna"
    }
  });

  revalidatePath("/karang-taruna");
  revalidatePath("/dashboard");
  return { success: true, log };
}

// 4. Real-Time Performance Summary for Kasi Pelayanan & Ketua KT
export async function getKarangTarunaPerformanceSummaryForKasiPelayanan() {
  const tenantId = await getTenantId();

  const [members, programs, finances, logs] = await Promise.all([
    prisma.katarMember.findMany({ where: { tenantId } }),
    prisma.katarProgram.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } }),
    prisma.katarFinance.findMany({ where: { tenantId }, orderBy: { date: "desc" } }),
    prisma.katarGallery.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 10 })
  ]);

  const saldoKas = finances.reduce((acc, f) => (f.type === "in" ? acc + f.amount : acc - f.amount), 0);
  const activeMembersCount = members.filter(m => m.status === "Aktif").length;
  const runningProgramsCount = programs.filter(p => p.status === "Berjalan").length;
  const completedProgramsCount = programs.filter(p => p.status === "Selesai").length;

  return {
    totalMembers: members.length,
    activeMembersCount,
    saldoKas,
    runningProgramsCount,
    completedProgramsCount,
    programs,
    recentLogs: logs,
    financesSummary: finances.slice(0, 5)
  };
}
