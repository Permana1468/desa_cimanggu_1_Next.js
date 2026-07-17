import "dotenv/config";
import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const passwordHash = await bcrypt.hash("desa1234", 10);
  
  // We need to fetch a valid tenantId first, or use the first tenant
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
      console.log("No tenant found. Exiting.");
      return;
  }

  // Create or update the user
  const user = await prisma.user.upsert({
    where: { email: "petagis@cimanggu1.desa.id" },
    update: {
      passwordHash,
      role: "OPERATOR_DESA", // We use OPERATOR_DESA as the role for this specific GIS observer
      fullName: "Peta GIS Center",
      isActive: true,
      tenantId: tenant.id
    },
    create: {
      email: "petagis@cimanggu1.desa.id",
      nik: "9999999999999998", // Dummy NIK
      passwordHash,
      fullName: "Peta GIS Center",
      role: "OPERATOR_DESA",
      isActive: true,
      tenantId: tenant.id
    },
  });

  console.log("Created user:", user.email, "for tenant:", tenant.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
