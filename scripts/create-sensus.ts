import { config } from 'dotenv';
config();
import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const hash = await bcrypt.hash('SensusDesa123!', 10);
  
  // Get tenant ID
  const tenant = await prisma.tenant.findFirst();
  
  await prisma.user.upsert({
    where: { email: 'sensus@cimanggu1.desa.id' },
    update: { 
      passwordHash: hash, 
      role: 'PETUGAS_SENSUS', 
      tenantId: tenant?.id || 'default' 
    },
    create: { 
      email: 'sensus@cimanggu1.desa.id', 
      fullName: 'Anggota Surveyor', 
      passwordHash: hash, 
      role: 'PETUGAS_SENSUS', 
      tenantId: tenant?.id || 'default' 
    }
  });
  console.log('User created');
}

main()
  .catch(console.error);
