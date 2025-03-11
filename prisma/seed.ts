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
  // await prisma.$executeRaw`TRUNCATE TABLE "role" CASCADE`;

  // ===== Buat Role =====
  console.log('Membuat role...');

  const projectManagerRole = await prisma.role.upsert({
    where: { roleName: 'project_manager' },
    update: {},
    create: {
      roleName: 'project_manager',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const developerRole = await prisma.role.upsert({
    where: { roleName: 'developer' },
    update: {},
    create: {
      roleName: 'developer',
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
      name: 'Budi Santoso',
      email: 'pm@paramalaga.com',
      password: pmPassword,
      emailVerifiedAt: new Date(),
      photoUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
      roleId: projectManagerRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Password: Dev123!
  const devPassword = await hash('Dev123!', 10);
  const developer1 = await prisma.user.upsert({
    where: { email: 'dev1@paramalaga.com' },
    update: {},
    create: {
      personnelId: 'DEV001',
      name: 'Siti Nurhaliza',
      email: 'dev1@paramalaga.com',
      password: devPassword,
      emailVerifiedAt: new Date(),
      photoUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
      roleId: developerRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const developer2 = await prisma.user.upsert({
    where: { email: 'dev2@paramalaga.com' },
    update: {},
    create: {
      personnelId: 'DEV002',
      name: 'Joko Widodo',
      email: 'dev2@paramalaga.com',
      password: devPassword,
      emailVerifiedAt: new Date(),
      photoUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
      roleId: developerRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // ===== Buat Projects =====
  console.log('Membuat projects...');
  const project1 = await prisma.project.upsert({
    where: { projectCode: 'PRJ-001' },
    update: {},
    create: {
      projectCode: 'PRJ-001',
      projectName: 'Website Company Profile PT KAI',
      projectOwner: 'PT Kereta Api Indonesia',
      statusId: ongoingStatus.id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-06-30'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const project2 = await prisma.project.upsert({
    where: { projectCode: 'PRJ-002' },
    update: {},
    create: {
      projectCode: 'PRJ-002',
      projectName: 'Aplikasi Mobile Banking BNI',
      projectOwner: 'Bank BNI',
      statusId: pendingStatus.id,
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-09-15'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const project3 = await prisma.project.upsert({
    where: { projectCode: 'PRJ-003' },
    update: {},
    create: {
      projectCode: 'PRJ-003',
      projectName: 'E-commerce Platform Bukalapak',
      projectOwner: 'Bukalapak',
      statusId: delayedStatus.id,
      startDate: new Date('2023-11-01'),
      endDate: new Date('2024-04-30'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const project4 = await prisma.project.upsert({
    where: { projectCode: 'PRJ-004' },
    update: {},
    create: {
      projectCode: 'PRJ-004',
      projectName: 'Internal HR System',
      projectOwner: 'PT Parama Laga',
      statusId: completedStatus.id,
      startDate: new Date('2023-08-01'),
      endDate: new Date('2023-12-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // ===== Buat Project Users (Assignment) =====
  console.log('Membuat project assignments...');
  const projectUser1 = await prisma.projectUser.upsert({
    where: {
      projectId_userId: {
        projectId: project1.id,
        userId: projectManager.id,
      },
    },
    update: {},
    create: {
      projectId: project1.id,
      userId: projectManager.id,
      position: 'Project Manager',
    },
  });

  const projectUser2 = await prisma.projectUser.upsert({
    where: {
      projectId_userId: {
        projectId: project1.id,
        userId: developer1.id,
      },
    },
    update: {},
    create: {
      projectId: project1.id,
      userId: developer1.id,
      position: 'Frontend Developer',
    },
  });

  const projectUser3 = await prisma.projectUser.upsert({
    where: {
      projectId_userId: {
        projectId: project1.id,
        userId: developer2.id,
      },
    },
    update: {},
    create: {
      projectId: project1.id,
      userId: developer2.id,
      position: 'Backend Developer',
    },
  });

  const projectUser4 = await prisma.projectUser.upsert({
    where: {
      projectId_userId: {
        projectId: project2.id,
        userId: projectManager.id,
      },
    },
    update: {},
    create: {
      projectId: project2.id,
      userId: projectManager.id,
      position: 'Project Manager',
    },
  });

  const projectUser5 = await prisma.projectUser.upsert({
    where: {
      projectId_userId: {
        projectId: project3.id,
        userId: projectManager.id,
      },
    },
    update: {},
    create: {
      projectId: project3.id,
      userId: projectManager.id,
      position: 'Project Manager',
    },
  });

  const projectUser6 = await prisma.projectUser.upsert({
    where: {
      projectId_userId: {
        projectId: project3.id,
        userId: developer1.id,
      },
    },
    update: {},
    create: {
      projectId: project3.id,
      userId: developer1.id,
      position: 'Full Stack Developer',
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