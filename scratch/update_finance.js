const fs = require('fs');
const path = require('path');

const financePath = path.join(__dirname, '../src/components/dashboard/roles/katar/KatarFinance.tsx');
let financeContent = fs.readFileSync(financePath, 'utf8');

financeContent = financeContent.replace(
    'import React from "react";',
    'import React, { useState, useEffect } from "react";\nimport { getKatarFinances, addKatarFinance, deleteKatarFinance } from "@/actions/katar";'
);

financeContent = financeContent.replace(
    /const mockFinance = \[[^\]]*\];/g,
    `const [financeData, setFinanceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await getKatarFinances();
        setFinanceData(data);
        setLoading(false);
    };`
);

financeContent = financeContent.replace(/mockFinance/g, 'financeData');
financeContent = financeContent.replace(/desc/g, 'description'); // to match our db schema
financeContent = financeContent.replace(/f\.desc/g, 'f.description'); 
financeContent = financeContent.replace(/f\.receipt/g, 'f.receiptUrl');

fs.writeFileSync(financePath, financeContent);
console.log("Updated KatarFinance");
