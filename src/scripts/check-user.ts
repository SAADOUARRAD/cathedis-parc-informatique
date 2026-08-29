import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../lib/prisma';

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { firstName: { contains: 'oualid' } },
        { lastName: { contains: 'elkarmany' } },
        { email: { contains: 'oualid' } }
      ]
    }
  });
  console.log('Users found:', JSON.stringify(users.map(u => ({ id: u.id, email: u.email, name: `${u.firstName} ${u.lastName}`, role: u.role })), null, 2));

  const maintenances = await prisma.maintenance.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5,
    include: {
      equipment: true,
      reportedBy: true,
      technician: true,
    }
  });
  console.log('Recent Maintenances:', JSON.stringify(maintenances.map(m => ({
    id: m.id,
    status: m.status,
    technicianId: m.technicianId,
    technicianName: m.technician ? `${m.technician.firstName} ${m.technician.lastName} (${m.technician.email})` : 'NON ASSIGNÉ',
    equipmentName: m.equipment?.name,
    updatedAt: m.updatedAt
  })), null, 2));
}

main().catch(console.error).finally(() => process.exit(0));
