import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Cleanup - hapus data yang mungkin sudah ada (opsional)
  console.log('Cleaning up database...');
  await prisma.activityResult.deleteMany();
  await prisma.activityItem.deleteMany();
  await prisma.activityCategory.deleteMany();
  await prisma.activityWeek.deleteMany();
  await prisma.taskProgress.deleteMany();
  await prisma.task.deleteMany();
  await prisma.templateChecklist.deleteMany();
  await prisma.taskTemplate.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.projectUser.deleteMany();
  await prisma.project.deleteMany();
  await prisma.documentType.deleteMany();
  // await prisma.projectStatus.deleteMany(); // Upsert handles this
  // await prisma.user.deleteMany(); // Upsert handles this
  // await prisma.roleAccess.deleteMany(); // Upsert handles this

  // ===== Buat Role =====
  console.log('Membuat role...');

  const adminRole = await prisma.roleAccess.upsert({
    where: { roleName: 'admin' },
    update: {},
    create: {
      roleName: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const projectManagerRole = await prisma.roleAccess.upsert({
    where: { roleName: 'project_manager' },
    update: {},
    create: {
      roleName: 'project_manager',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const employeeRole = await prisma.roleAccess.upsert({
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

  // Password: Admin123!
  const adminPassword = await hash('Admin123!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@paramalaga.com' },
    update: {},
    create: {
      personnelId: 'ADM001',
      name: 'Administrator',
      email: 'admin@paramalaga.com',
      password: adminPassword,
      status: 'active',
      role: 'Admin',
      emailVerifiedAt: new Date(),
      roleId: adminRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

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
      roleId: projectManagerRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Password: User123!
  const employeePassword = await hash('User123!', 10);
  const employeeUser = await prisma.user.upsert({
    where: { email: 'user@paramalaga.com' },
    update: {},
    create: {
      personnelId: 'EMP001',
      name: 'Employee User',
      email: 'user@paramalaga.com',
      password: employeePassword,
      status: 'active',
      role: 'Employee',
      emailVerifiedAt: new Date(),
      roleId: employeeRole.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  // ===== Buat Document Type =====
  console.log('Membuat document types...');
  const docTypes = ['Design', 'Technical', 'Legal', 'Financial', 'Report'];
  const createdDocTypes = await Promise.all(
    docTypes.map((name) =>
      prisma.documentType.create({
        data: { name },
      })
    )
  );

  // ===== Buat Checklist & Templates =====
  console.log('Membuat checklists & templates...');
  const checklist1 = await prisma.checklist.create({
    data: { criteria: 'Review Dokumen', hint: 'Pastikan format sesuai standar' },
  });
  const checklist2 = await prisma.checklist.create({
    data: { criteria: 'Approval Manager', hint: 'Tanda tangan basah atau digital' },
  });

  const template = await prisma.taskTemplate.create({
    data: {
      templateName: 'Standard Approval Workflow',
      templateChecklists: {
        create: [
          { checklistId: checklist1.id },
          { checklistId: checklist2.id },
        ],
      },
    },
  });

  // ===== Buat Project =====
  console.log('Membuat projects...');
  const project1 = await prisma.project.upsert({
    where: { projectCode: 'PRJ-001' },
    update: {},
    create: {
      projectCode: 'PRJ-001',
      projectName: 'Website E-Commerce Development',
      projectOwner: 'PT Maju Jaya',
      statusId: ongoingStatus.id,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-06-30'),
      projectUsers: {
        create: [
          { userId: adminUser.id },
          { userId: projectManager.id },
          { userId: employeeUser.id },
        ],
      },
    },
  });

  const project2 = await prisma.project.upsert({
    where: { projectCode: 'PRJ-002' },
    update: {},
    create: {
      projectCode: 'PRJ-002',
      projectName: 'Mobile App UI/UX Redesign',
      projectOwner: 'Tech Corp',
      statusId: pendingStatus.id,
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-05-01'),
      projectUsers: {
        create: [
          { userId: projectManager.id },
        ],
      },
    },
  });

  // ===== Buat Task =====
  console.log('Membuat tasks...');
  const task1 = await prisma.task.create({
    data: {
      taskName: 'Create Wireframe',
      documentTypeId: createdDocTypes[0].id,
      projectId: project1.id,
      userId: employeeUser.id,
      dateAdded: new Date(),
      taskStatus: 'OnGoing',
      progresses: {
        create: [
          { checklistId: checklist1.id, checked: true, comment: 'Selesai direview' },
          { checklistId: checklist2.id, checked: false },
        ],
      },
    },
  });

  // ===== Buat Activity Reports =====
  console.log('Membuat activity reports...');
  const week1 = await prisma.activityWeek.create({
    data: {
      projectId: project1.id,
      weekNum: 1,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-07'),
      categories: {
        create: [
          {
            name: 'Development',
            userId: employeeUser.id,
            projectId: project1.id,
            items: {
              create: [
                {
                  name: 'Frontend Implementation',
                  results: {
                    create: { result: '80%', comment: 'Hampir selesai' },
                  },
                },
              ],
            },
          },
        ],
      },
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