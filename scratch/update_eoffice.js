const fs = require('fs');
const path = require('path');

const eofficePath = path.join(__dirname, '../src/components/dashboard/roles/katar/KatarEOffice.tsx');
let eoContent = fs.readFileSync(eofficePath, 'utf8');

eoContent = eoContent.replace(
    'import React, { useState } from "react";',
    'import React, { useState, useEffect } from "react";\nimport { getKatarSurats, addKatarSurat, deleteKatarSurat } from "@/actions/katar";'
);

// We need to replace mockSuratMasuk and mockSuratKeluar
eoContent = eoContent.replace(
    /const mockSuratMasuk = \[[^\]]*\];/g,
    `const [suratData, setSuratData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await getKatarSurats();
        setSuratData(data);
        setLoading(false);
    };

    const mockSuratMasuk = suratData.filter(s => s.type === "masuk");
    const mockSuratKeluar = suratData.filter(s => s.type === "keluar");`
);

eoContent = eoContent.replace(/const mockSuratKeluar = \[[^\]]*\];/g, '');
eoContent = eoContent.replace(/date/g, 'tanggal');

fs.writeFileSync(eofficePath, eoContent);
console.log("Updated KatarEOffice");
