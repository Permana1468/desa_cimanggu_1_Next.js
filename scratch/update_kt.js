const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/dashboard/roles/KarangTarunaDashboardClient.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Imports for new components
const importStr = `import { KatarOverview } from "./katar/KatarOverview";
import { KatarMembers } from "./katar/KatarMembers";
import { KatarFinance } from "./katar/KatarFinance";
import { KatarEOffice } from "./katar/KatarEOffice";
import { KatarInventory } from "./katar/KatarInventory";
import { KatarPrograms } from "./katar/KatarPrograms";
import { KatarEconomy } from "./katar/KatarEconomy";
import { KatarGallery } from "./katar/KatarGallery";`;

if (!content.includes('KatarOverview')) {
    content = content.replace('export function KarangTarunaDashboardClient() {', `${importStr}\n\nexport function KarangTarunaDashboardClient() {`);
}

// 2. Replace Tab Rendering
const oldTabRendering = `{/* TAB CONTENT RENDERING */}
            {activeTab === "overview" && (
                <div className="space-y-6">
                    {/* STATS */}`;

const targetIndex = content.indexOf(oldTabRendering);
const endBoundary = content.indexOf('</div>\n    );\n}');

const newTabRendering = `{/* TAB CONTENT RENDERING */}
            {activeTab === "overview" && <KatarOverview lembaga={lembaga} session={session} />}
            {activeTab === "anggota" && <KatarMembers session={session} />}
            {activeTab === "finance" && <KatarFinance session={session} />}
            {activeTab === "eoffice" && <KatarEOffice session={session} />}
            {activeTab === "inventory" && <KatarInventory session={session} />}
            {activeTab === "kegiatan" && <KatarPrograms session={session} />}
            {activeTab === "wirausaha" && <KatarEconomy session={session} />}
            {activeTab === "gallery" && <KatarGallery session={session} />}`;

content = content.substring(0, targetIndex) + newTabRendering + '\n        ' + content.substring(endBoundary);

fs.writeFileSync(filePath, content);
console.log("Replaced Tab Rendering!");
