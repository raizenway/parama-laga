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
  
    const requirementsDoc = await prisma.documentType.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Requirements Document",
      },
    });
  
    const designDoc = await prisma.documentType.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: "Design Document",
      },
    });
  
    const technicalDoc = await prisma.documentType.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: "Technical Documentation",
      },
    });
  
    const userManual = await prisma.documentType.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: "User Manual",
      },
    });
  
    const testReport = await prisma.documentType.upsert({
      where: { id: 5 },
      update: {},
      create: {
        name: "Test Report",
      },
    });
  
    const projectPlan = await prisma.documentType.upsert({
      where: { id: 6 },
      update: {},
      create: {
        name: "Project Plan",
      },
    });
  
    const codeReview = await prisma.documentType.upsert({
      where: { id: 7 },
      update: {},
      create: {
        name: "Code Review",
      },
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
      role: 'Project Manager', // Adding role field
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
      status: 'active',
      role: 'Developer', // Adding role field
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
      status: 'inactive',
      role: 'Developer', // Adding role field
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
        projectId: project3.id,
        userId: projectManager.id,
      },
    },
    update: {},
    create: {
      projectId: project3.id,
      userId: projectManager.id,
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
    },
  });

  // ===== Buat Checklist Items =====
  console.log('Membuat checklist items...');
  const checklist1 = await prisma.checklist.upsert({
    where: { id: 1 },
    update: {},
    create: {
      criteria: "Code functionality has been tested",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const checklist2 = await prisma.checklist.upsert({
    where: { id: 2 },
    update: {},
    create: {
      criteria: "Code meets coding standards",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const checklist3 = await prisma.checklist.upsert({
    where: { id: 3 },
    update: {},
    create: {
      criteria: "Documentation is complete",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const checklist4 = await prisma.checklist.upsert({
    where: { id: 4 },
    update: {},
    create: {
      criteria: "Security review completed",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const checklist5 = await prisma.checklist.upsert({
    where: { id: 5 },
    update: {},
    create: {
      criteria: "UI/UX review completed",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // ===== Buat Task Templates =====
  console.log('Membuat task templates...');
  const template1 = await prisma.taskTemplate.upsert({
    where: { templateName: "Backend Feature Development" },
    update: {},
    create: {
      templateName: "Backend Feature Development",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const template2 = await prisma.taskTemplate.upsert({
    where: { templateName: "Frontend Component Development" },
    update: {},
    create: {
      templateName: "Frontend Component Development",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const template3 = await prisma.taskTemplate.upsert({
    where: { templateName: "API Integration" },
    update: {},
    create: {
      templateName: "API Integration",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // ===== Link Templates with Checklists =====
  console.log('Linking templates with checklists...');
  const templateChecklist1 = await prisma.templateChecklist.upsert({
    where: { id: 1 },
    update: {},
    create: {
      templateId: template1.id,
      checklistId: checklist1.id,
    },
  });

  const templateChecklist2 = await prisma.templateChecklist.upsert({
    where: { id: 2 },
    update: {},
    create: {
      templateId: template1.id,
      checklistId: checklist2.id,
    },
  });

  const templateChecklist3 = await prisma.templateChecklist.upsert({
    where: { id: 3 },
    update: {},
    create: {
      templateId: template1.id,
      checklistId: checklist3.id,
    },
  });

  const templateChecklist4 = await prisma.templateChecklist.upsert({
    where: { id: 4 },
    update: {},
    create: {
      templateId: template2.id,
      checklistId: checklist1.id,
    },
  });

  const templateChecklist5 = await prisma.templateChecklist.upsert({
    where: { id: 5 },
    update: {},
    create: {
      templateId: template2.id,
      checklistId: checklist2.id,
    },
  });

  const templateChecklist6 = await prisma.templateChecklist.upsert({
    where: { id: 6 },
    update: {},
    create: {
      templateId: template2.id,
      checklistId: checklist5.id,
    },
  });


  console.log('Creating sample tasks...');
  const task1 = await prisma.task.upsert({
    where: { id: 1 },
    update: {},
    create: {
      taskName: "Implement User Authentication",
      documentTypeId: technicalDoc.id,  // Add document type ID
      templateId: template1.id,
      projectId: project1.id,
      userId: developer2.id,
      dateAdded: new Date('2024-01-15'),
    },
  });

  const task2 = await prisma.task.upsert({
    where: { id: 2 },
    update: {},
    create: {
      taskName: "Create Landing Page",
      documentTypeId: designDoc.id,  // Add document type ID
      templateId: template2.id,
      projectId: project1.id,
      userId: developer1.id,
      dateAdded: new Date('2024-01-20'),
    },
  });
  
  // Add one more task example
  const task3 = await prisma.task.upsert({
    where: { id: 3 },
    update: {},
    create: {
      taskName: "API Documentation",
      documentTypeId: userManual.id,
      templateId: template3.id,
      projectId: project2.id,
      userId: developer1.id,
      dateAdded: new Date('2024-02-05'),
    },
  });
  // ===== Create Task Progress =====
  console.log('Creating task progress...');
  const taskProgress1 = await prisma.taskProgress.upsert({
    where: { id: 1 },
    update: {},
    create: {
      taskId: task1.id,
      checklistId: checklist1.id,
      checked: true,
      comment: "All tests passing",
      updatedAt: new Date()
    },
  });

  const taskProgress2 = await prisma.taskProgress.upsert({
    where: { id: 2 },
    update: {},
    create: {
      taskId: task1.id,
      checklistId: checklist2.id,
      checked: true,
      comment: "Code reviewed by senior dev",
      updatedAt: new Date()
    },
  });

  const taskProgress3 = await prisma.taskProgress.upsert({
    where: { id: 3 },
    update: {},
    create: {
      taskId: task1.id,
      checklistId: checklist3.id,
      checked: false,
      comment: "API documentation pending",
      updatedAt: new Date()
    },
  });

  const taskProgress4 = await prisma.taskProgress.upsert({
    where: { id: 4 },
    update: {},
    create: {
      taskId: task2.id,
      checklistId: checklist1.id,
      checked: true,
      comment: "All component tests passing",
      updatedAt: new Date()
    },
  });

  const taskProgress5 = await prisma.taskProgress.upsert({
    where: { id: 5 },
    update: {},
    create: {
      taskId: task2.id,
      checklistId: checklist5.id,
      checked: false,
      comment: "Waiting for UX review",
      updatedAt: new Date()
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