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

  // ===== Create Document Types =====
  console.log('Creating document types...');
  const incomingLetter = await prisma.documentType.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Surat Masuk' },
  });
  const outgoingLetter = await prisma.documentType.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Surat Keluar' },
  });
  const disposisiForm = await prisma.documentType.upsert({
    where: { id: 3 },
    update: {},
    create: { name: 'Form Disposisi' },
  });
  const archiveDoc = await prisma.documentType.upsert({
    where: { id: 4 },
    update: {},
    create: { name: 'Dokumen Arsip' },
  });

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
      name: 'Budi Santoso',
      email: 'pm@paramalaga.com',
      password: pmPassword,
      status: 'active',
      role: 'Project Manager',
      emailVerifiedAt: new Date(),
      photoUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
      roleId: projectManagerRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Password: Employee123!
  const empPassword = await hash('Employee123!', 10);
  const employee1 = await prisma.user.upsert({
    where: { email: 'alfian@persuratan.com' },
    update: {},
    create: {
      personnelId: 'EMP001',
      name: 'Alfian Nur',
      email: 'alfian@persuratan.com',
      password: empPassword,
      status: 'active',
      role: 'Employee',
      emailVerifiedAt: new Date(),
      photoUrl: 'https://randomuser.me/api/portraits/men/5.jpg',
      roleId: developerRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const employee2 = await prisma.user.upsert({
    where: { email: 'rizka@persuratan.com' },
    update: {},
    create: {
      personnelId: 'EMP002',
      name: 'Rizka Amelia',
      email: 'rizka@persuratan.com',
      password: empPassword,
      status: 'active',
      role: 'Employee',
      emailVerifiedAt: new Date(),
      photoUrl: 'https://randomuser.me/api/portraits/women/6.jpg',
      roleId: developerRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // ===== Buat Projects =====
  console.log('Membuat projects...');
  const project1 = await prisma.project.upsert({
    where: { projectCode: 'PSRT-001' },
    update: {},
    create: {
      projectCode: 'PSRT-001',
      projectName: 'Sistem Manajemen Persuratan',
      projectOwner: 'PT Persuratan Digital',
      statusId: ongoingStatus.id,
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-12-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const project2 = await prisma.project.upsert({
    where: { projectCode: 'DSPS-001' },
    update: {},
    create: {
      projectCode: 'DSPS-001',
      projectName: 'Sistem Disposisi Surat',
      projectOwner: 'Kementerian XYZ',
      statusId: pendingStatus.id,
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-10-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // ===== Buat Project Users (Assignment) =====
  console.log('Membuat project assignments...');
  const projectUser3 = await prisma.projectUser.upsert({
    where: {
      projectId_userId: {
        projectId: project1.id,
        userId: employee2.id,
      },
    },
    update: {},
    create: {
      projectId: project1.id,
      userId: employee2.id,
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
    },
  });

  const projectUser5 = await prisma.projectUser.upsert({
    where: {
      projectId_userId: {
        projectId: project2.id,
        userId: employee1.id,
      },
    },
    update: {},
    create: {
      projectId: project2.id,
      userId: employee1.id,
    },
  });

  const projectUser6 = await prisma.projectUser.upsert({
    where: {
      projectId_userId: {
        projectId: project2.id,
        userId: employee2.id,
      },
    },
    update: {},
    create: {
      projectId: project2.id,
      userId: employee2.id,
    },
  });

  // ===== Create Activity Weeks =====
  console.log('Membuat activity weeks...');
  const week1_p1 = await prisma.activityWeek.upsert({
    where: { id: 1 },
    update: {},
    create: {
      projectId: project1.id,
      weekNum: 1,
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-07'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const week1_p2 = await prisma.activityWeek.upsert({
    where: { id: 2 },
    update: {},
    create: {
      projectId: project2.id,
      weekNum: 1,
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-07'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // ===== Aktivitas per Employee di week yang sama =====
  console.log('Membuat activity categories & items...');
  // Project 1, Employee2
  const cat1_emp2_p1 = await prisma.activityCategory.upsert({
    where: { id: 2 },
    update: {},
    create: {
      userId: employee2.id,
      projectId: project1.id,
      weekId: week1_p1.id,
      name: 'Pendataan Surat Keluar',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const item1_emp2_p1 = await prisma.activityItem.upsert({
    where: { id: 2 },
    update: {},
    create: {
      categoryId: cat1_emp2_p1.id,
      name: 'Update nomor surat',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Project 2, Employee2
  const cat1_emp2_p2 = await prisma.activityCategory.upsert({
    where: { id: 4 },
    update: {},
    create: {
      userId: employee2.id,
      projectId: project2.id,
      weekId: week1_p2.id,
      name: 'Arsip Surat',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const item1_emp2_p2 = await prisma.activityItem.upsert({
    where: { id: 4 },
    update: {},
    create: {
      categoryId: cat1_emp2_p2.id,
      name: 'Scan & simpan PDF',
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