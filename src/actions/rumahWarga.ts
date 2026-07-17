"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getSessionOrThrow() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

import { buildWilayahFilterScope } from "@/actions/rt";

/**
 * Get list of RumahWarga for the logged-in RT/RW user.
 * Supports filtering by query (noKK / alamat) and optionally by rt/rw.
 */
export async function getRumahWargaList(query = "", filterRt = "", filterRw = "") {
  const session = await getSessionOrThrow();
  const user = session.user as any;
  const tenantId = user.tenantId;

  // For RT/RW role, it uses their session RT/RW. For others, it uses the provided filters.
  const { filterScope } = await buildWilayahFilterScope(user.role, user.rt || filterRt, user.rw || filterRw, tenantId);

  const list = await prisma.rumahWarga.findMany({
    where: {
      ...filterScope,
      ...(query && {
        OR: [
          { noKK: { contains: query, mode: "insensitive" } },
          { alamat: { contains: query, mode: "insensitive" } },
          { lokasiDetail: { contains: query, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
  });

  // Enrich with Kepala Keluarga data from DataKependudukan
  const kkNumbers = [...new Set(list.map((r) => r.noKK))];
  const kepalaKeluargaList = await prisma.dataKependudukan.findMany({
    where: {
      tenantId,
      noKK: { in: kkNumbers },
      hubunganKeluarga: "KEPALA_KELUARGA",
    },
    select: { noKK: true, namaLengkap: true, nik: true, rt: true, rw: true },
  });

  const kkMap: Record<string, { namaLengkap: string; nik: string; rt: string; rw: string }> = {};
  for (const kk of kepalaKeluargaList) {
    kkMap[kk.noKK] = { namaLengkap: kk.namaLengkap, nik: kk.nik, rt: kk.rt, rw: kk.rw };
  }

  return list.map((r) => ({
    ...r,
    kepalaKeluarga: kkMap[r.noKK] || null,
  }));
}

/**
 * Get a single RumahWarga by KK number.
 */
export async function getRumahWargaByKK(noKK: string) {
  const session = await getSessionOrThrow();
  const user = session.user as any;
  const tenantId = user.tenantId;

  const rumah = await prisma.rumahWarga.findFirst({
    where: { tenantId, noKK },
  });

  if (!rumah) return null;

  // Fetch anggota KK
  const anggota = await prisma.dataKependudukan.findMany({
    where: { tenantId, noKK },
    orderBy: [{ hubunganKeluarga: "asc" }],
    select: {
      id: true,
      namaLengkap: true,
      nik: true,
      hubunganKeluarga: true,
      jenisKelamin: true,
      pekerjaan: true,
    },
  });

  return { ...rumah, anggota };
}

/**
 * Get list of KK numbers that don't have a RumahWarga record yet (for quick-add).
 */
export async function getKKWithoutRumah() {
  const session = await getSessionOrThrow();
  const user = session.user as any;
  const tenantId = user.tenantId;

  const { filterScope } = await buildWilayahFilterScope(user.role, user.rt, user.rw, tenantId);

  const allKK = await prisma.dataKependudukan.findMany({
    where: {
      ...filterScope,
      hubunganKeluarga: "KEPALA_KELUARGA",
    },
    select: { noKK: true, namaLengkap: true, alamat: true, rt: true, rw: true },
  });

  const existingKK = await prisma.rumahWarga.findMany({
    where: filterScope,
    select: { noKK: true },
  });

  const existingSet = new Set(existingKK.map((r) => r.noKK));
  
  // Deduplicate by noKK in case of dirty database data (multiple KEPALA_KELUARGA for same noKK)
  const uniqueKKs: typeof allKK = [];
  const seenKKs = new Set<string>();
  
  for (const kk of allKK) {
    if (!existingSet.has(kk.noKK) && !seenKKs.has(kk.noKK)) {
      uniqueKKs.push(kk);
      seenKKs.add(kk.noKK);
    }
  }

  return uniqueKKs;
}

/**
 * Add a new RumahWarga record.
 */
export async function addRumahWarga(data: {
  noKK: string;
  rt: string;
  rw: string;
  alamat: string;
  latitude?: number | null;
  longitude?: number | null;
  lokasiDetail?: string;
  fotoUrl?: string;
  statusRumah?: string;
  kondisi?: string;
  keterangan?: string;
}) {
  const session = await getSessionOrThrow();
  const user = session.user as any;
  const tenantId = user.tenantId;

  // Check if noKK already has a rumah record
  const existing = await prisma.rumahWarga.findFirst({ where: { tenantId, noKK: data.noKK } });
  if (existing) {
    return { success: false, error: "No KK ini sudah memiliki data rumah warga." };
  }

  await prisma.rumahWarga.create({
    data: {
      ...data,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      tenantId,
    },
  });

  return { success: true };
}

/**
 * Update an existing RumahWarga record.
 */
export async function updateRumahWarga(
  id: string,
  data: {
    alamat?: string;
    latitude?: number | null;
    longitude?: number | null;
    lokasiDetail?: string;
    fotoUrl?: string;
    statusRumah?: string;
    kondisi?: string;
    keterangan?: string;
  }
) {
  const session = await getSessionOrThrow();
  const user = session.user as any;
  const tenantId = user.tenantId;

  await prisma.rumahWarga.update({
    where: { id, tenantId },
    data: {
      ...data,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
    },
  });

  return { success: true };
}

/**
 * Delete a RumahWarga record.
 */
export async function deleteRumahWarga(id: string) {
  const session = await getSessionOrThrow();
  const user = session.user as any;
  const tenantId = user.tenantId;

  await prisma.rumahWarga.delete({ where: { id, tenantId } });
  return { success: true };
}
