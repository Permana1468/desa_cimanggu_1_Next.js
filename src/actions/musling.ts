"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface MuslingUsulanItem {
    id: string;
    jenisKegiatan: string;
    volume: string;
    sifatKegiatan: "BARU" | "LAMA" | "REHAB";
    besarnyaBiaya: number;
    keterangan: string;
    sumberRt?: string;
}

export interface MuslingRtSubmission {
    rtNo: string;
    rwNo: string;
    namaKetuaRt?: string;
    sentAt?: string;
    tahun: string;
    items: MuslingUsulanItem[];
    status: "pending" | "approved" | "revised";
    revisionNote?: string;
    updatedAt: string;
}

interface MuslingRwStore {
    rw: string;
    tahun: string;
    submissions: Record<string, MuslingRtSubmission>; // keyed by padded RT e.g. "001"
}

function pad3(val?: string | number | null): string {
    const clean = String(val || "0").replace(/\D/g, "");
    return (clean || "0").padStart(3, "0");
}

function getStoreId(rw: string, tahun: string): string {
    return `musling_store_rw_${pad3(rw)}_year_${tahun || "2026"}`;
}

async function getMuslingSession() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const role = String((session.user as any).role || "").toUpperCase();
    const tenantId = (session.user as any).tenantId;
    const userRt = pad3((session.user as any).rt);
    const userRw = pad3((session.user as any).rw);

    const allowed = ["RT", "RW", "KADUS", "KAUR_PERENCANAAN", "KAUR", "ADMIN_DESA", "KADES", "SEKDES", "ADMIN_MASTER"];
    if (!allowed.includes(role)) {
        throw new Error("Akses ditolak.");
    }
    return { session, role, tenantId, userRt, userRw };
}

/**
 * Mengambil daftar resmi RT yang berada di bawah naungan RW tertentu dari village_structure
 */
export async function getOfficialRtsForRw(rwParam: string): Promise<string[]> {
    const targetRw = pad3(rwParam);
    const targetRaw = String(parseInt(targetRw, 10));
    try {
        const config = await prisma.systemSetting.findUnique({
            where: { id: "village_structure" }
        });
        const structure = (config?.settings as any) || { dusun: [] };
        const rtSet = new Set<string>();

        for (const d of structure.dusun || []) {
            for (const rwObj of d.rw || []) {
                const rwName = String(rwObj.name || rwObj.nomor || "");
                const rwDigits = rwName.replace(/\D/g, "");
                if (rwDigits === targetRw || rwDigits === targetRaw || pad3(rwDigits) === targetRw) {
                    for (const rtItem of rwObj.rt || []) {
                        const rtStr = typeof rtItem === "string" ? rtItem : String(rtItem?.name || rtItem?.nomor || "");
                        const rtDigits = rtStr.replace(/\D/g, "");
                        if (rtDigits) rtSet.add(pad3(rtDigits));
                    }
                }
            }
        }
        return Array.from(rtSet).sort();
    } catch {
        return [];
    }
}

async function readStore(rw: string, tahun: string): Promise<MuslingRwStore> {
    const storeId = getStoreId(rw, tahun);
    const row = await prisma.systemSetting.findUnique({ where: { id: storeId } });
    if (row?.settings && typeof row.settings === "object") {
        const s = row.settings as any;
        return {
            rw: pad3(rw),
            tahun,
            submissions: s.submissions || {}
        };
    }
    return { rw: pad3(rw), tahun, submissions: {} };
}

async function writeStore(store: MuslingRwStore) {
    const storeId = getStoreId(store.rw, store.tahun);
    await prisma.systemSetting.upsert({
        where: { id: storeId },
        create: {
            id: storeId,
            settings: store as any
        },
        update: {
            settings: store as any
        }
    });
}

/**
 * Mengambil rekapitulasi Musling RW beserta daftar RT resmi cakupan RW tersebut
 */
export async function getMuslingRwRecap(rwParam?: string, tahunParam = "2026") {
    const { role, userRw } = await getMuslingSession();
    const targetRw = role === "RW" ? userRw : pad3(rwParam || userRw);

    const [officialRts, store] = await Promise.all([
        getOfficialRtsForRw(targetRw),
        readStore(targetRw, tahunParam)
    ]);

    const allSubmissions = Object.values(store.submissions);
    // Filter strictly to RTs that belong to officialRts if officialRts is populated,
    // while also keeping any existing submission already recorded for this RW
    const officialSet = new Set(officialRts);
    const allKnownRts = Array.from(new Set([...officialRts, ...allSubmissions.map(s => pad3(s.rtNo))])).sort();

    const pendingSubmissions = allSubmissions
        .filter(s => s.status === "pending" && (officialSet.size === 0 || officialSet.has(pad3(s.rtNo))))
        .sort((a, b) => pad3(a.rtNo).localeCompare(pad3(b.rtNo)));

    const approvedArchive = allSubmissions
        .filter(s => s.status === "approved" && (officialSet.size === 0 || officialSet.has(pad3(s.rtNo))))
        .sort((a, b) => pad3(a.rtNo).localeCompare(pad3(b.rtNo)));

    const revisedSubmissions = allSubmissions
        .filter(s => s.status === "revised" && (officialSet.size === 0 || officialSet.has(pad3(s.rtNo))))
        .sort((a, b) => pad3(a.rtNo).localeCompare(pad3(b.rtNo)));

    const rtCoverage = allKnownRts.map(rt => {
        const sub = store.submissions[rt];
        return {
            rtNo: rt,
            status: sub?.status || "not_sent",
            itemCount: sub?.items?.length || 0,
            namaKetuaRt: sub?.namaKetuaRt || `Ketua RT ${rt}`
        };
    });

    return {
        rwNo: targetRw,
        tahun: tahunParam,
        officialRts: allKnownRts,
        rtCoverage,
        pendingSubmissions,
        approvedArchive,
        revisedSubmissions
    };
}

/**
 * Mengambil status usulan Musling untuk RT yang sedang login (sinkron lintas device)
 */
export async function getMuslingRtStatus(rtParam?: string, rwParam?: string, tahunParam = "2026") {
    const { role, userRt, userRw } = await getMuslingSession();
    const targetRt = role === "RT" ? userRt : pad3(rtParam || userRt);
    const targetRw = role === "RT" || role === "RW" ? userRw : pad3(rwParam || userRw);

    const store = await readStore(targetRw, tahunParam);
    return store.submissions[targetRt] || null;
}

/**
 * RT mengirim / menyinkronkan usulan ke Ketua RW (tersimpan di PostgreSQL)
 */
export async function submitMuslingUsulanRt(payload: {
    rtNo?: string;
    rwNo?: string;
    namaKetuaRt?: string;
    tahun?: string;
    items: MuslingUsulanItem[];
    status?: "pending" | "approved" | "revised";
}) {
    const { role, userRt, userRw } = await getMuslingSession();
    const targetRt = role === "RT" ? userRt : pad3(payload.rtNo || userRt);
    const targetRw = role === "RT" || role === "RW" ? userRw : pad3(payload.rwNo || userRw);
    const tahun = payload.tahun || "2026";

    // Validasi bahwa RT memang cakupan RW tersebut (jika struktur desa sudah terisi)
    const officialRts = await getOfficialRtsForRw(targetRw);
    if (officialRts.length > 0 && !officialRts.includes(targetRt)) {
        return { success: false, error: `RT ${targetRt} tidak terdaftar di bawah cakupan RW ${targetRw}.` };
    }

    const store = await readStore(targetRw, tahun);
    const existing = store.submissions[targetRt];
    // Jangan timpa status approved jika dipanggil oleh sync pasif, kecuali status eksplisit pending dari submit baru
    const nextStatus = payload.status || "pending";

    store.submissions[targetRt] = {
        rtNo: targetRt,
        rwNo: targetRw,
        namaKetuaRt: payload.namaKetuaRt || existing?.namaKetuaRt || `Ketua RT ${targetRt}`,
        sentAt: existing?.sentAt || new Date().toISOString(),
        tahun,
        items: (payload.items || []).map(it => ({ ...it, sumberRt: targetRt })),
        status: nextStatus,
        revisionNote: nextStatus === "pending" ? undefined : existing?.revisionNote,
        updatedAt: new Date().toISOString()
    };

    await writeStore(store);
    revalidatePath("/dashboard");
    return { success: true, submission: store.submissions[targetRt] };
}

/**
 * Sinkronisasi batch data legacy localStorage ke database (aman & idempoten, tidak menimpa data DB yang lebih baru)
 */
export async function syncLegacyLocalSubmissionsToDb(
    rwParam: string,
    tahun: string,
    legacyItems: MuslingRtSubmission[]
) {
    const { role, userRw } = await getMuslingSession();
    const targetRw = role === "RW" ? userRw : pad3(rwParam || userRw);
    if (!legacyItems || legacyItems.length === 0) return { synced: 0 };

    const officialRts = await getOfficialRtsForRw(targetRw);
    const officialSet = new Set(officialRts);
    const store = await readStore(targetRw, tahun);
    let synced = 0;

    for (const item of legacyItems) {
        const cleanRt = pad3(item.rtNo);
        if (officialSet.size > 0 && !officialSet.has(cleanRt)) continue;
        if (!store.submissions[cleanRt] && Array.isArray(item.items) && item.items.length > 0) {
            store.submissions[cleanRt] = {
                ...item,
                rtNo: cleanRt,
                rwNo: targetRw,
                tahun,
                items: item.items.map(it => ({ ...it, sumberRt: cleanRt })),
                updatedAt: new Date().toISOString()
            };
            synced++;
        }
    }

    if (synced > 0) {
        await writeStore(store);
    }
    return { synced };
}

/**
 * Ketua RW menyetujui 1 atau semua usulan RT sekaligus (Atomik, bebas race condition)
 */
export async function approveMuslingRtSubmissions(rwParam: string, tahun: string, rtNos: string[]) {
    const { role, userRw } = await getMuslingSession();
    if (!["RW", "ADMIN_DESA", "KADES", "SEKDES", "ADMIN_MASTER"].includes(role)) {
        throw new Error("Hanya Ketua RW atau Pimpinan Desa yang dapat memverifikasi usulan RT.");
    }

    const targetRw = role === "RW" ? userRw : pad3(rwParam || userRw);
    const store = await readStore(targetRw, tahun);

    let approvedCount = 0;
    for (const rawRt of rtNos) {
        const cleanRt = pad3(rawRt);
        if (store.submissions[cleanRt]) {
            store.submissions[cleanRt].status = "approved";
            store.submissions[cleanRt].revisionNote = undefined;
            store.submissions[cleanRt].updatedAt = new Date().toISOString();
            approvedCount++;
        }
    }

    await writeStore(store);
    revalidatePath("/dashboard");
    return { success: true, approvedCount };
}

/**
 * Ketua RW mengirim catatan revisi dan mengembalikan usulan ke RT
 */
export async function reviseMuslingRtSubmission(rwParam: string, tahun: string, rtNo: string, revisionNote: string) {
    const { role, userRw } = await getMuslingSession();
    if (!["RW", "ADMIN_DESA", "KADES", "SEKDES", "ADMIN_MASTER"].includes(role)) {
        throw new Error("Hanya Ketua RW yang dapat mengirim catatan revisi.");
    }

    const targetRw = role === "RW" ? userRw : pad3(rwParam || userRw);
    const cleanRt = pad3(rtNo);
    const store = await readStore(targetRw, tahun);

    if (store.submissions[cleanRt]) {
        store.submissions[cleanRt].status = "revised";
        store.submissions[cleanRt].revisionNote = revisionNote;
        store.submissions[cleanRt].updatedAt = new Date().toISOString();
        await writeStore(store);
    }

    revalidatePath("/dashboard");
    return { success: true };
}

