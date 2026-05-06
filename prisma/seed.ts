import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Create Default Tenant
  const tenant = await prisma.tenant.upsert({
    where: { domain: "cimanggu1.desa.id" },
    update: {},
    create: {
      name: "Desa Cimanggu I",
      domain: "cimanggu1.desa.id",
      isActive: true,
    },
  });

  console.log("Tenant created:", tenant.id);

  // 2. Create Admin Master
  const hashedPassword = await bcrypt.hash("AdminMaster123!", 10);
  
  const adminMaster = await prisma.user.upsert({
    where: { email: "master@cimanggu1.desa.id" },
    update: {},
    create: {
      email: "master@cimanggu1.desa.id",
      fullName: "Admin Master Cimanggu",
      passwordHash: hashedPassword,
      role: "ADMIN_MASTER",
      tenantId: tenant.id,
      isActive: true,
    },
  });

  // 3. Create Admin Desa
  const hashedDesaPassword = await bcrypt.hash("AdminDesa123!", 10);
  const adminDesa = await prisma.user.upsert({
    where: { email: "desa@cimanggu1.desa.id" },
    update: {},
    create: {
      email: "desa@cimanggu1.desa.id",
      fullName: "Admin Desa Cimanggu",
      passwordHash: hashedDesaPassword,
      role: "ADMIN_DESA",
      tenantId: tenant.id,
      isActive: true,
    },
  });

  console.log("Admin Desa created:", adminDesa.email);

  // 4. Seed Default Permissions
  const modules = ["SURAT", "WARGA", "PROFIL", "APARATUR", "KEUANGAN", "BUMDES"];
  const roles = ["ADMIN_DESA", "KADES", "SEKDES", "RT", "RW", "KASI", "KAUR", "KADUS"];

  for (const role of roles) {
    for (const module of modules) {
      await prisma.rolePermission.upsert({
        where: { role_module: { role: role as any, module } },
        update: {},
        create: {
          role: role as any,
          module,
          canView: true,
          canCreate: ["ADMIN_DESA", "SEKDES", "KASI", "KAUR"].includes(role),
          canUpdate: ["ADMIN_DESA", "SEKDES"].includes(role),
          canDelete: role === "ADMIN_DESA",
        },
      });
    }
  }
  console.log("Default permissions seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
