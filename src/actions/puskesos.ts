"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- Pengaduan & Keluhan ---
export async function getPuskesosPengaduan(tenantId: string) {
  return await prisma.puskesosPengaduan.findMany({
    where: { tenantId },
    include: {
      warga: {
        select: { namaLengkap: true, nik: true, rt: true, rw: true, alamat: true }
      },
      petugas: {
        select: { fullName: true }
      }
    },
    orderBy: { tanggalMasuk: 'desc' }
  });
}

export async function createPuskesosPengaduan(data: any) {
  let wargaId = data.wargaId;
  if (!wargaId && data.nik) {
    const w = await prisma.dataKependudukan.findUnique({ where: { nik: data.nik } });
    if (!w) throw new Error("NIK warga tidak ditemukan di database");
    wargaId = w.id;
  }
  
  const res = await prisma.puskesosPengaduan.create({
    data: {
      wargaId: wargaId,
      jenisPengaduan: data.jenisPengaduan,
      deskripsi: data.deskripsi,
      tenantId: data.tenantId,
      status: "MENUNGGU"
    }
  });
  revalidatePath('/dashboard/puskesos');
  return res;
}

export async function updateStatusPengaduan(id: string, status: string, petugasId?: string) {
  const data: any = { status };
  if (petugasId) data.petugasId = petugasId;
  if (status === 'SELESAI') data.tanggalSelesai = new Date();

  const res = await prisma.puskesosPengaduan.update({
    where: { id },
    data
  });
  revalidatePath('/dashboard/puskesos');
  return res;
}

// --- Manajemen Rujukan ---
export async function getPuskesosRujukan(tenantId: string) {
  return await prisma.puskesosRujukan.findMany({
    where: { tenantId },
    include: {
      warga: {
        select: { namaLengkap: true, nik: true }
      },
      pengaduan: true
    },
    orderBy: { tanggal: 'desc' }
  });
}

export async function createPuskesosRujukan(data: any) {
  let wargaId = data.wargaId;
  if (!wargaId && data.nik) {
    const w = await prisma.dataKependudukan.findUnique({ where: { nik: data.nik } });
    if (!w) throw new Error("NIK warga tidak ditemukan di database");
    wargaId = w.id;
  }
  
  const res = await prisma.puskesosRujukan.create({
    data: {
      pengaduanId: data.pengaduanId || null,
      wargaId: wargaId,
      instansiTujuan: data.instansiTujuan,
      nomorSuratRujukan: data.nomorSuratRujukan,
      keteranganRujukan: data.keteranganRujukan,
      tenantId: data.tenantId,
      status: "DRAFT"
    }
  });
  revalidatePath('/dashboard/puskesos');
  return res;
}

// --- Program & Kegiatan ---
export async function getPuskesosKegiatan(tenantId: string) {
  return await prisma.puskesosKegiatan.findMany({
    where: { tenantId },
    orderBy: { tanggal: 'desc' }
  });
}

export async function createPuskesosKegiatan(data: any) {
  const res = await prisma.puskesosKegiatan.create({
    data: {
      namaKegiatan: data.namaKegiatan,
      jenisKegiatan: data.jenisKegiatan,
      lokasi: data.lokasi,
      tanggal: new Date(data.tanggal),
      dokumentasi: data.dokumentasi || null,
      tenantId: data.tenantId,
      status: "RENCANA"
    }
  });
  revalidatePath('/dashboard/puskesos');
  return res;
}

// --- Pengurus ---
export async function getPuskesosPengurus(tenantId: string) {
  return await prisma.puskesosPengurus.findMany({
    where: { tenantId, statusAktif: true },
    orderBy: { nama: 'asc' }
  });
}

export async function createPuskesosPengurus(data: any) {
  const res = await prisma.puskesosPengurus.create({
    data: {
      nama: data.nama,
      jabatan: data.jabatan,
      noHp: data.noHp,
      tenantId: data.tenantId,
      statusAktif: true
    }
  });
  revalidatePath('/dashboard/puskesos');
  return res;
}
