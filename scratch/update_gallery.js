const fs = require('fs');
const path = require('path');

const galleryPath = path.join(__dirname, '../src/components/dashboard/roles/katar/KatarGallery.tsx');
let galContent = fs.readFileSync(galleryPath, 'utf8');

galContent = galContent.replace(
    'import React, { useState } from "react";',
    'import React, { useState, useEffect } from "react";\nimport { getKatarGalleries, addKatarGallery, deleteKatarGallery } from "@/actions/katar";'
);

galContent = galContent.replace(
    /const mockDocs = \[[^\]]*\];/g,
    `const [galleryData, setGalleryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await getKatarGalleries();
        setGalleryData(data);
        setLoading(false);
    };

    const mockDocs = galleryData.filter(s => s.type === "document");
    const mockPhotos = galleryData.filter(s => s.type === "image");`
);

galContent = galContent.replace(/const mockPhotos = \[[^\]]*\];/g, '');
galContent = galContent.replace(/name/g, 'fileName');

fs.writeFileSync(galleryPath, galContent);
console.log("Updated KatarGallery");
