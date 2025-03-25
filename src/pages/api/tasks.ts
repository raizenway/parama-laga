import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from './auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

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
    
    // If ID is provided, fetch a specific task
    if (id) {
      const task = await prisma.task.findUnique({
        where: { id: parseInt(id as string) },
        include: {
          documentType: true,
          template: true,
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

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      return res.status(200).json(task);
    }

    // Build search condition
    const searchQuery = search as string || '';
    const whereCondition = searchQuery
      ? {
          taskName: { contains: searchQuery, mode: 'insensitive' }
        }
      : {};

    // Fetch all tasks with filtering
    const tasks = await prisma.task.findMany({
      where: whereCondition,
      include: {
        documentType: true,
        template: true,
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
    const { taskName, documentTypeId, templateId, projectId, userId, iteration } = req.body;

    // Validate required fields
    if (!taskName || !documentTypeId || !templateId || !projectId || !userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        taskName,
        documentTypeId: parseInt(documentTypeId),
        templateId: parseInt(templateId),
        projectId: parseInt(projectId),
        userId: parseInt(userId),
        iteration: iteration || 1,
        dateAdded: new Date()
      },
      include: {
        documentType: true,
        template: {
          include: {
            templateChecklists: {
              include: {
                checklist: true
              }
            }
          }
        }
      }
    });

    // Create task progress items for each checklist in the template
    const checklistItems = task.template.templateChecklists.map(tc => {
      return {
        taskId: task.id,
        checklistId: tc.checklistId,
        checked: false,
        updatedAt: new Date()
      };
    });

    if (checklistItems.length > 0) {
      await prisma.taskProgress.createMany({
        data: checklistItems
      });
    }

    return res.status(201).json(task);
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
      iteration, 
      progresses,
      assignee, // New parameter from frontend
      status // Status may be provided from frontend
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    const taskId = parseInt(id as string);
    
    // Prepare update data
    const updateData: any = {};
    
    // Only include fields in the update if they're provided
    if (taskName) updateData.taskName = taskName;
    if (documentTypeId) updateData.documentTypeId = parseInt(documentTypeId);
    if (templateId) updateData.templateId = parseInt(templateId);
    if (projectId) updateData.projectId = parseInt(projectId);
    if (iteration) updateData.iteration = iteration;
    
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
        template: true,
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