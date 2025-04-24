import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { AuthOptions } from 'next-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as AuthOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Task ID is required' });
  }
  
  const taskId = parseInt(id);
  
  if (isNaN(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }
  
  // GET: Fetch a single task with all relevant data
  if (req.method === 'GET') {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
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
            },
            orderBy: {
              id: 'asc'
            }
          }
        }
      });
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      return res.status(200).json(task);
    } catch (error) {
      console.error('Error fetching task:', error);
      return res.status(500).json({ message: 'Failed to fetch task' });
    }
  }
  
  // PUT: Update a task
  else if (req.method === 'PUT') {
    try {
      const { taskName, documentTypeId, assignees, projectId } = req.body;
      
      const existingTask = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          progresses: true
        }
      });
      
      if (!existingTask) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      // Update task
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          taskName: taskName || existingTask.taskName,
          documentTypeId: documentTypeId || existingTask.documentTypeId,
          projectId: projectId || existingTask.projectId
        },
        include: {
          documentType: true,
          project: true,
          user: true,
          progresses: {
            include: {
              checklist: true
            }
          }
        }
      });
      
      // If assignees are provided, update task assignment
      if (assignees && Array.isArray(assignees) && assignees.length > 0) {
        // For now, we're only implementing single user assignment
        // In a real app, you might want to implement multi-user assignments
        const user = await prisma.user.findFirst({
          where: { name: assignees[0] }
        });
        
        if (user) {
          await prisma.task.update({
            where: { id: taskId },
            data: { userId: user.id }
          });
        }
      }
      
      return res.status(200).json(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      return res.status(500).json({ message: 'Failed to update task' });
    }
  }
  
    // DELETE: Delete a task
    else if (req.method === 'DELETE') {
      try {
        // Check if task exists
        const task = await prisma.task.findUnique({
          where: { id: taskId }
        });
        
        if (!task) {
          return res.status(404).json({ message: 'Task not found' });
        }
        
        // Use transaction to ensure all related records are deleted
        await prisma.$transaction(async (tx) => {
          // First delete all related task progress entries
          await tx.taskProgress.deleteMany({
            where: { taskId }
          });
          
          // Then delete the task itself
          await tx.task.delete({
            where: { id: taskId }
          });
        });
        
        return res.status(200).json({ message: 'Task deleted successfully' });
      } catch (error) {
        console.error('Error deleting task:', error);
        return res.status(500).json({ 
          message: 'Failed to delete task',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }  

  // Method not supported
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}