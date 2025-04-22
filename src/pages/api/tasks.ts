import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from './auth/[...nextauth]';
import { AuthOptions } from 'next-auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as AuthOptions);

  // Check if user is logged in
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Handle various HTTP methods
  switch (req.method) {
    case 'GET':
      return getTasks(req, res);
    case 'POST':
      return createTask(req, res);
    case 'PUT':
      return updateTask(req, res);
    case 'DELETE':
      return deleteTask(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Function to get all tasks or a specific task
async function getTasks(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, search } = req.query;
    const session = await getServerSession(req, res, authOptions as AuthOptions);
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;
    

    // console.log('Session user info:', {
    //   role: userRole,
    //   id: userId,
    //   user: session?.user
    // });

    // If ID is provided, fetch a specific task
    if (id) {
      const task = await prisma.task.findUnique({
        where: { id: parseInt(id as string) },
        include: {
          documentType: true,
          project: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              personnelId: true
            }
          },
          progresses: {
            include: {
              checklist: true
            }
          }
        }
      });

      // If employee is trying to access a task not assigned to them, deny access
      if (
        userRole !== 'admin' && 
        userRole !== 'project_manager' && 
        task?.userId !== userId
      ) {
        return res.status(403).json({ message: 'You do not have permission to view this task' });
      }

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      return res.status(200).json(task);
    }

    // Build search condition
    const searchQuery = search as string || '';
    let whereCondition: any = searchQuery
      ? {
          taskName: { contains: searchQuery, mode: 'insensitive' }
        }
      : {};

    // For employees, only show their assigned tasks
    if (userRole !== 'admin' && userRole !== 'project_manager'&& userId) {
      whereCondition = {
        ...whereCondition,
        userId: typeof userId === 'number' ? userId : parseInt(userId.toString())
      };
    }

    // Fetch all tasks with filtering
    const tasks = await prisma.task.findMany({
      where: whereCondition,
      include: {
        documentType: true,
        project: true,
        user: {
          select: {
            id: true,
            name: true
          }
        },
        progresses: {
          include: {
            checklist: true
          }
        }
      },
      orderBy: {
        dateAdded: 'desc'
      }
    });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
}

// Function to create a new task
async function createTask(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { taskName, documentTypeId, templateId, projectId, userId } = req.body;
    const session = await getServerSession(req, res, authOptions as AuthOptions);
    const userRole = (session?.user as any)?.role;
    const currentUserId = (session?.user as any)?.id;

    // Validate required fields with better error messages
    if (!taskName) return res.status(400).json({ message: 'Task name is required' });
    if (!documentTypeId) return res.status(400).json({ message: 'Document type is required' });
    if (!templateId) return res.status(400).json({ message: 'Template is required' });
    if (!projectId) return res.status(400).json({ message: 'Project is required' });
    
    // Handle employee case specifically - they don't need to provide userId
    let assigneeId;
    if (userRole !== 'admin' && userRole !== 'project_manager') {
      // For employees, always assign to themselves
      assigneeId = parseInt(currentUserId);
      if (isNaN(assigneeId)) {
        return res.status(400).json({ message: 'Invalid user ID from session' });
      }
    } else {
      // For admins/PMs, require the userId field
      if (!userId) return res.status(400).json({ message: 'User ID is required' });
      assigneeId = parseInt(userId);
      if (isNaN(assigneeId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }
    }

      // ‑‑‑ clone template & snapshot
    const tpl = await prisma.taskTemplate.findUnique({
      where: { id: parseInt(templateId.toString()) },
      include: { templateChecklists: true }
    });
    if (!tpl) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // buat task, simpan snapshot templateName
    const task = await prisma.task.create({
      data: {
        taskName,
        documentTypeId: parseInt(documentTypeId.toString()),
        templateSnapshot: tpl.templateName,
        projectId: parseInt(projectId.toString()),
        userId: assigneeId,
        dateAdded: new Date(),
        taskStatus: "NotStarted"
      }
    });

    // clone checklist ke TaskProgress
    const checklistItems = tpl.templateChecklists.map(tc => ({
      taskId: task.id,
      checklistId: tc.checklistId,
      checked: false,
      updatedAt: new Date()
    }));

      if (checklistItems.length > 0) {
        await prisma.taskProgress.createMany({
          data: checklistItems
        });
      }

      // kembalikan record lengkap
      const full = await prisma.task.findUnique({
        where: { id: task.id },
        include: {
          documentType: true,
          project: true,
          user: { select: { id: true, name: true } },
          progresses: { include: { checklist: true } }
        }
      });
    return res.status(201).json(full);
    } catch (error) {
      console.error('Error creating task:', error);
      return res.status(500).json({ message: 'Internal server error', error });
    }
  }

// Function to update an existing task
async function updateTask(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { 
      taskName, 
      documentTypeId, 
      templateId, 
      projectId, 
      userId, 
      progresses,
      assignee,
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    const taskId = parseInt(id as string);
    
    // Prepare update data
    const updateData: any = {};
    
    // Only include fields in the update if they're provided
    if (taskName) updateData.taskName = taskName;
    
    // Enhanced error handling for documentTypeId
    if (documentTypeId !== undefined && documentTypeId !== null) {
      try {
        updateData.documentTypeId = typeof documentTypeId === 'number' 
          ? documentTypeId 
          : parseInt(documentTypeId.toString());
      } catch (e) {
        console.error("Error parsing documentTypeId:", documentTypeId, e);
      }
    }
    
    // Enhanced error handling for templateId
    if (templateId !== undefined && templateId !== null) {
      try {
        updateData.templateId = typeof templateId === 'number' 
          ? templateId 
          : parseInt(templateId.toString());
      } catch (e) {
        console.error("Error parsing templateId:", templateId, e);
      }
    }
    
    // Enhanced error handling for projectId
    if (projectId !== undefined && projectId !== null) {
      try {
        updateData.projectId = typeof projectId === 'number' 
          ? projectId 
          : parseInt(projectId.toString());
        console.log("Project ID successfully parsed:", updateData.projectId);
      } catch (e) {
        console.error("Error parsing projectId:", projectId, e);
      }
    }
    
    
      
    // Handle user assignment - either directly by userId or by assignee name
    if (userId) {
      updateData.userId = parseInt(userId);
    } 
    else if (assignee) {
      // Look up user by name
      const user = await prisma.user.findFirst({
        where: { name: assignee }
      });
      
      if (user) {
        updateData.userId = user.id;
      } else {
        return res.status(404).json({ message: `User '${assignee}' not found` });
      }
    }

    // Update the task
    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        documentType: true,
        project: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            personnelId: true
          }
        },
        progresses: {
          include: {
            checklist: true
          }
        }
      }
    });

    // Update task progresses if provided
    if (progresses && Array.isArray(progresses)) {
      for (const progress of progresses) {
        await prisma.taskProgress.update({
          where: { id: progress.id },
          data: {
            checked: progress.checked,
            comment: progress.comment,
            updatedAt: new Date()
          }
        });
      }
    }

    return res.status(200).json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
}

// Function to delete a task
async function deleteTask(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    // Delete related task progress items first
    await prisma.taskProgress.deleteMany({
      where: { taskId: parseInt(id as string) }
    });

    // Delete the task
    await prisma.task.delete({
      where: { id: parseInt(id as string) }
    });

    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
}