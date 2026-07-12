const fs = require('fs');
const path = require('path');

const inventoryPath = path.join(__dirname, '../src/components/dashboard/roles/katar/KatarInventory.tsx');
let invContent = fs.readFileSync(inventoryPath, 'utf8');

invContent = invContent.replace(
    'import React from "react";',
    'import React, { useState, useEffect } from "react";\nimport { getKatarInventories, addKatarInventory, deleteKatarInventory } from "@/actions/katar";'
);

invContent = invContent.replace(
    /const mockInventory = \[[^\]]*\];/g,
    `const [inventoryData, setInventoryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await getKatarInventories();
        setInventoryData(data);
        setLoading(false);
    };`
);

invContent = invContent.replace(/mockInventory/g, 'inventoryData');
invContent = invContent.replace(/i\.item/g, 'i.name'); // To match DB column name

fs.writeFileSync(inventoryPath, invContent);
console.log("Updated KatarInventory");
