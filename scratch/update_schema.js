const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

const newModels = `
// ==========================================
// KARANG TARUNA SPECIFIC MODELS
// ==========================================

model KatarFinance {
  id          String   @id @default(uuid())
  date        DateTime @default(now())
  description String
  type        String   // "in" | "out"
  amount      Float
  receiptUrl  String?
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model KatarInventory {
  id          String   @id @default(uuid())
  name        String
  category    String
  quantity    Int      @default(0)
  condition   String   // "Baik" | "Rusak Ringan" | "Rusak Berat"
  status      String   // "Tersedia" | "Dipinjam"
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  loans       KatarInventoryLoan[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model KatarInventoryLoan {
  id          String   @id @default(uuid())
  inventoryId String
  inventory   KatarInventory @relation(fields: [inventoryId], references: [id], onDelete: Cascade)
  borrower    String
  borrowDate  DateTime @default(now())
  dueDate     DateTime
  returnDate  DateTime?
  status      String   // "Aktif" | "Selesai" | "Terlambat"
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model KatarSurat {
  id          String   @id @default(uuid())
  noSurat     String
  type        String   // "masuk" | "keluar"
  perihal     String
  pengirim    String?
  tujuan      String?
  tanggal     DateTime @default(now())
  status      String   // "Belum Dibaca" | "Dibaca" | "Terkirim"
  fileUrl     String?
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model KatarGallery {
  id          String   @id @default(uuid())
  fileName    String
  type        String   // "document" | "image"
  size        String
  fileUrl     String
  category    String   // "LPJ" | "Dokumentasi"
  date        DateTime @default(now())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
`;

if (!schemaContent.includes('model KatarFinance')) {
    schemaContent += newModels;
    
    // Inject back-relations to model Tenant
    const tenantRelations = `
  katarFinances KatarFinance[]
  katarInventories KatarInventory[]
  katarInventoryLoans KatarInventoryLoan[]
  katarSurats KatarSurat[]
  katarGalleries KatarGallery[]
`;
    // Find the end of model Tenant { ... }
    const tenantStartIndex = schemaContent.indexOf('model Tenant {');
    const tenantEndIndex = schemaContent.indexOf('}', tenantStartIndex);
    
    if (tenantStartIndex !== -1 && tenantEndIndex !== -1) {
        schemaContent = schemaContent.substring(0, tenantEndIndex) + tenantRelations + schemaContent.substring(tenantEndIndex);
    }
}

fs.writeFileSync(schemaPath, schemaContent);
console.log("Appended to schema.prisma");
