"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper to get tenantId safely
async function getTenantId(): Promise<string | null> {
  const session = await getServerSession(authOptions);

  return session?.user?.tenantId ?? null;
}

// ==============================
// KATAR FINANCE
// ==============================

export async function getKatarFinances() {
  const tenantId = await getTenantId();
  if (!tenantId) return [];
  return await prisma.katarFinance.findMany({
    where: { tenantId },
    orderBy: { date: "desc" },
  });
}

export async function addKatarFinance(data: {
  description: string;
  amount: number;
  type: "in" | "out";
  receiptUrl?: string;
}) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Unauthorized");
  await prisma.katarFinance.create({
    data: { tenantId, ...data, date: new Date() },
  });
  revalidatePath("/kelembagaan");
}

export async function deleteKatarFinance(id: string) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Unauthorized");
  await prisma.katarFinance.deleteMany({ where: { id, tenantId } });
  revalidatePath("/kelembagaan");
}

// ==============================
// KATAR INVENTORY
// ==============================

export async function getKatarInventories() {
  const tenantId = await getTenantId();
  if (!tenantId) return [];
  return await prisma.katarInventory.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { loans: { where: { status: "Aktif" } } },
  });
}

export async function addKatarInventory(data: {
  name: string;
  category: string;
  quantity: number;
  condition: string;
  status: string;
}) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Unauthorized");
  await prisma.katarInventory.create({ data: { tenantId, ...data } });
  revalidatePath("/kelembagaan");
}

export async function deleteKatarInventory(id: string) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Unauthorized");
  await prisma.katarInventory.deleteMany({ where: { id, tenantId } });
  revalidatePath("/kelembagaan");
}

// ==============================
// KATAR SURAT
// ==============================

export async function getKatarSurats() {
  const tenantId = await getTenantId();
  if (!tenantId) return [];
  return await prisma.katarSurat.findMany({
    where: { tenantId },
    orderBy: { tanggal: "desc" },
  });
}

export async function addKatarSurat(data: {
  noSurat: string;
  perihal: string;
  type: "masuk" | "keluar";
  tujuan?: string;
  pengirim?: string;
}) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Unauthorized");
  await prisma.katarSurat.create({
    data: {
      tenantId,
      ...data,
      status: data.type === "masuk" ? "Belum Dibaca" : "Terkirim",
    },
  });
  revalidatePath("/kelembagaan");
}

export async function deleteKatarSurat(id: string) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Unauthorized");
  await prisma.katarSurat.deleteMany({ where: { id, tenantId } });
  revalidatePath("/kelembagaan");
}

// ==============================
// KATAR GALLERY
// ==============================

export async function getKatarGalleries() {
  const tenantId = await getTenantId();
  if (!tenantId) return [];
  return await prisma.katarGallery.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function addKatarGallery(data: {
  fileName: string;
  fileUrl: string;
  type: "image" | "document";
  category: string;
  size?: string;
}) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Unauthorized");
  await prisma.katarGallery.create({
    data: { tenantId, size: "—", ...data },
  });
  revalidatePath("/kelembagaan");
}

export async function deleteKatarGallery(id: string) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Unauthorized");
  await prisma.katarGallery.deleteMany({ where: { id, tenantId } });
  revalidatePath("/kelembagaan");
}

// ==============================
// KATAR MEMBERS
// ==============================

export async function getKatarMembers() {
  const tenantId = await getTenantId();
  if (!tenantId) return [];
  return await prisma.katarMember.findMany({
    where: { tenantId },
    orderBy: { createdAt: "asc" },
  });
}

export async function addKatarMember(data: {
  name: string;
  role: string;
  rt?: string;
  rw?: string;
  phone?: string;
  skills?: string;
  status: string;
}) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Unauthorized");
  await prisma.katarMember.create({ data: { tenantId, ...data } });
  revalidatePath("/kelembagaan");
}

export async function deleteKatarMember(id: string) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Unauthorized");
  await prisma.katarMember.deleteMany({ where: { id, tenantId } });
  revalidatePath("/kelembagaan");
}

// ==============================
// KATAR PROGRAMS (PROKER)
// ==============================

export async function getKatarPrograms() {
  const tenantId = await getTenantId();
  if (!tenantId) return [];
  return await prisma.katarProgram.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function addKatarProgram(data: {
  title: string;
  description?: string;
  panitia?: number;
  progress?: number;
  status: string;
  startDate?: string;
  endDate?: string;
}) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Unauthorized");
  await prisma.katarProgram.create({
    data: {
      tenantId,
      title: data.title,
      description: data.description,
      panitia: data.panitia ?? 0,
      progress: data.progress ?? 0,
      status: data.status,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  });
  revalidatePath("/kelembagaan");
}

export async function updateKatarProgramProgress(id: string, progress: number, status: string) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Unauthorized");
  await prisma.katarProgram.updateMany({
    where: { id, tenantId },
    data: { progress, status },
  });
  revalidatePath("/kelembagaan");
}

export async function deleteKatarProgram(id: string) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Unauthorized");
  await prisma.katarProgram.deleteMany({ where: { id, tenantId } });
  revalidatePath("/kelembagaan");
}

// ==============================
// KATAR UMKM
// ==============================

export async function getKatarUmkms() {
  const tenantId = await getTenantId();
  if (!tenantId) return [];
  return await prisma.katarUmkm.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function addKatarUmkm(data: {
  name: string;
  owner: string;
  category: string;
  income?: string;
  address?: string;
  phone?: string;
  status: string;
}) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Unauthorized");
  await prisma.katarUmkm.create({ data: { tenantId, ...data } });
  revalidatePath("/kelembagaan");
}

export async function deleteKatarUmkm(id: string) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Unauthorized");
  await prisma.katarUmkm.deleteMany({ where: { id, tenantId } });
  revalidatePath("/kelembagaan");
}

// ==============================
// KATAR LOKER
// ==============================

export async function getKatarLokers() {
  const tenantId = await getTenantId();
  if (!tenantId) return [];
  return await prisma.katarLoker.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function addKatarLoker(data: {
  title: string;
  company: string;
  type: string;
  location?: string;
  description?: string;
  salary?: string;
}) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Unauthorized");
  await prisma.katarLoker.create({ data: { tenantId, ...data } });
  revalidatePath("/kelembagaan");
}

export async function deleteKatarLoker(id: string) {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("Unauthorized");
  await prisma.katarLoker.deleteMany({ where: { id, tenantId } });
  revalidatePath("/kelembagaan");
}

// ==============================
// OVERVIEW STATS
// ==============================

export async function getKatarOverviewStats() {
  const tenantId = await getTenantId();
  if (!tenantId) return { totalMembers: 0, saldoKas: 0, programBerjalan: 0, totalSurat: 0 };

  const [members, finances, programs, surats] = await Promise.all([
    prisma.katarMember.count({ where: { tenantId, status: "Aktif" } }),
    prisma.katarFinance.findMany({ where: { tenantId } }),
    prisma.katarProgram.count({ where: { tenantId, status: "Berjalan" } }),
    prisma.katarSurat.count({ where: { tenantId } }),
  ]);

  const saldoKas = finances.reduce(
    (acc, f) => (f.type === "in" ? acc + f.amount : acc - f.amount),
    0
  );

  return { totalMembers: members, saldoKas, programBerjalan: programs, totalSurat: surats };
}
