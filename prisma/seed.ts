import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Cleanup - hapus data yang mungkin sudah ada (opsional)
  // await prisma.$executeRaw`TRUNCATE TABLE "project_users" CASCADE`;
  // await prisma.$executeRaw`TRUNCATE TABLE "sessions" CASCADE`;
  // await prisma.$executeRaw`TRUNCATE TABLE "verification_tokens" CASCADE`;
  // await prisma.$executeRaw`TRUNCATE TABLE "users" CASCADE`;
  // await prisma.$executeRaw`TRUNCATE TABLE "project" CASCADE`;
  // await prisma.$executeRaw`TRUNCATE TABLE "project_status" CASCADE`;
  // await prisma.$executeRaw`TRUNCATE TABLE "role_access" CASCADE`;
  // await prisma.$executeRaw`TRUNCATE TABLE "checklists" CASCADE`;
  // await prisma.$executeRaw`TRUNCATE TABLE "task_templates" CASCADE`;
  // await prisma.$executeRaw`TRUNCATE TABLE "template_checklists" CASCADE`;
  // await prisma.$executeRaw`TRUNCATE TABLE "tasks" CASCADE`;
  // await prisma.$executeRaw`TRUNCATE TABLE "task_progress" CASCADE`;
  // await prisma.$executeRaw`TRUNCATE TABLE "document_types" CASCADE`;

  // ===== Buat Role =====
  console.log('Membuat role...');

  const projectManagerRole = await prisma.roleAccess.upsert({
    where: { roleName: 'project_manager' },
    update: {},
    create: {
      roleName: 'project_manager',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const developerRole = await prisma.roleAccess.upsert({
    where: { roleName: 'employee' },
    update: {},
    create: {
      roleName: 'employee',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // ===== Buat Project Status =====
  console.log('Membuat project status...');
  const pendingStatus = await prisma.projectStatus.upsert({
    where: { statusName: 'Pending' },
    update: {},
    create: {
      statusName: 'Pending',
    },
  });

  const ongoingStatus = await prisma.projectStatus.upsert({
    where: { statusName: 'Ongoing' },
    update: {},
    create: {
      statusName: 'Ongoing',
    },
  });

  const completedStatus = await prisma.projectStatus.upsert({
    where: { statusName: 'Completed' },
    update: {},
    create: {
      statusName: 'Completed',
    },
  });

  const delayedStatus = await prisma.projectStatus.upsert({
    where: { statusName: 'Delayed' },
    update: {},
    create: {
      statusName: 'Delayed',
    },
  });

  // ===== Buat User =====  
  console.log('Membuat user...');

  // Password: Manager123!
  const pmPassword = await hash('Manager123!', 10);
  const projectManager = await prisma.user.upsert({
    where: { email: 'pm@paramalaga.com' },
    update: {},
    create: {
      personnelId: 'PM001',
      name: 'Project Manager',
      email: 'pm@paramalaga.com',
      password: pmPassword,
      status: 'active',
      role: 'Project Manager',
      emailVerifiedAt: new Date(),
      photoUrl: '',
      roleId: projectManagerRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log('Seed berhasil!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });