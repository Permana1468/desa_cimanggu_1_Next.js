export interface WargaField {
    key: string;
    label: string;
    type: "text" | "select" | "date" | "textarea";
    required: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
}

export const WARGA_FIELDS: WargaField[] = [
    {
        key: "nik",
        label: "Nomor Induk Kependudukan (NIK)",
        type: "text",
        required: true,
        placeholder: "Masukkan 16 digit NIK"
    },
    {
        key: "noKK",
        label: "Nomor Kartu Keluarga (NO KK)",
        type: "text",
        required: true,
        placeholder: "Masukkan 16 digit No KK"
    },
    {
        key: "namaLengkap",
        label: "Nama Lengkap (Sesuai KTP)",
        type: "text",
        required: true,
        placeholder: "Nama Lengkap"
    },
    {
        key: "jenisKelamin",
        label: "Jenis Kelamin",
        type: "select",
        required: true,
        options: [
            { value: "LAKI_LAKI", label: "LAKI-LAKI" },
            { value: "PEREMPUAN", label: "PEREMPUAN" }
        ]
    },
    {
        key: "tempatLahir",
        label: "Tempat Lahir",
        type: "text",
        required: true,
        placeholder: "Kota / Kabupaten"
    },
    {
        key: "tanggalLahir",
        label: "Tanggal Lahir",
        type: "date",
        required: true
    },
    {
        key: "agama",
        label: "Agama",
        type: "select",
        required: true,
        options: [
            { value: "ISLAM", label: "ISLAM" },
            { value: "KRISTEN", label: "KRISTEN" },
            { value: "KATOLIK", label: "KATOLIK" },
            { value: "HINDU", label: "HINDU" },
            { value: "BUDHA", label: "BUDHA" },
            { value: "KONGHUCU", label: "KONGHUCU" }
        ]
    },
    {
        key: "pendidikan",
        label: "Pendidikan Terakhir",
        type: "select",
        required: true,
        options: [
            { value: "TIDAK_SEKOLAH", label: "TIDAK SEKOLAH" },
            { value: "SD", label: "SD" },
            { value: "SMP", label: "SMP" },
            { value: "SMA", label: "SMA/SMK" },
            { value: "D3", label: "DIPLOMA (D3)" },
            { value: "S1", label: "SARJANA (S1)" },
            { value: "S2", label: "MAGISTER (S2)" },
            { value: "S3", label: "DOKTOR (S3)" }
        ]
    },
    {
        key: "pekerjaan",
        label: "Pekerjaan",
        type: "text",
        required: false,
        placeholder: "Pekerjaan saat ini"
    },
    {
        key: "golonganDarah",
        label: "Golongan Darah",
        type: "select",
        required: true,
        options: [
            { value: "-", label: "- TIDAK TAHU -" },
            { value: "A", label: "A" },
            { value: "B", label: "B" },
            { value: "AB", label: "AB" },
            { value: "O", label: "O" }
        ]
    },
    {
        key: "statusKawin",
        label: "Status Perkawinan",
        type: "select",
        required: true,
        options: [
            { value: "BELUM_KAWIN", label: "BELUM KAWIN" },
            { value: "KAWIN", label: "KAWIN" },
            { value: "CERAI_HIDUP", label: "CERAI HIDUP" },
            { value: "CERAI_MATI", label: "CERAI MATI" }
        ]
    },
    {
        key: "hubunganKeluarga",
        label: "Hubungan Dalam Keluarga",
        type: "select",
        required: true,
        options: [
            { value: "KEPALA_KELUARGA", label: "KEPALA KELUARGA" },
            { value: "ISTRI", label: "ISTRI" },
            { value: "ANAK", label: "ANAK" },
            { value: "MERTUA", label: "MERTUA" },
            { value: "ORANG_TUA", label: "ORANG TUA" },
            { value: "LAINNYA", label: "LAINNYA" }
        ]
    },
    {
        key: "kewarganegaraan",
        label: "Kewarganegaraan",
        type: "select",
        required: true,
        options: [
            { value: "WNI", label: "WNI" },
            { value: "WNA", label: "WNA" }
        ]
    },
    {
        key: "namaAyah",
        label: "Nama Ayah",
        type: "text",
        required: false,
        placeholder: "Nama Ayah Kandung"
    },
    {
        key: "namaIbu",
        label: "Nama Ibu",
        type: "text",
        required: false,
        placeholder: "Nama Ibu Kandung"
    },
    {
        key: "alamat",
        label: "Kampung / Alamat Domisili",
        type: "text",
        required: true,
        placeholder: "Nama Kampung / Alamat Lengkap"
    },
    {
        key: "dusun",
        label: "Dusun",
        type: "text",
        required: true,
        placeholder: "Nama Dusun"
    },
    {
        key: "rw",
        label: "RW",
        type: "text",
        required: true,
        placeholder: "Nomor RW (contoh: 002)"
    },
    {
        key: "rt",
        label: "RT",
        type: "text",
        required: true,
        placeholder: "Nomor RT (contoh: 001)"
    }
];

export const DEFAULT_WARGA_FORM = {
    nik: "",
    noKK: "",
    namaLengkap: "",
    jenisKelamin: "LAKI_LAKI",
    tempatLahir: "",
    tanggalLahir: "",
    pekerjaan: "",
    agama: "ISLAM",
    pendidikan: "SD",
    golonganDarah: "-",
    statusKawin: "BELUM_KAWIN",
    hubunganKeluarga: "KEPALA_KELUARGA",
    kewarganegaraan: "WNI",
    namaAyah: "",
    namaIbu: "",
    alamat: "",
    rt: "",
    rw: "",
    dusun: ""
};

/**
 * Checks if a resident has incomplete/un-synchronized fields.
 */
export function isWargaDataIncomplete(warga: any): boolean {
    if (!warga) return true;
    
    const requiredKeys = [
        "nik",
        "noKK",
        "namaLengkap",
        "jenisKelamin",
        "tempatLahir",
        "tanggalLahir",
        "agama",
        "alamat",
        "rt",
        "rw",
        "dusun",
        "pendidikan",
        "pekerjaan",
        "golonganDarah",
        "statusKawin",
        "hubunganKeluarga",
        "kewarganegaraan",
        "namaAyah",
        "namaIbu"
    ];

    for (const key of requiredKeys) {
        const val = warga[key];
        // Treat null, undefined, empty spaces, or placeholder "-" as incomplete
        if (val === null || val === undefined || String(val).trim() === "" || val === "-") {
            return true;
        }
    }
    
    return false;
}
