import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify user is authenticated
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { taskId } = req.query;
  
  if (!taskId || typeof taskId !== 'string') {
    return res.status(400).json({ message: 'Task ID is required' });
  }

  // GET: Fetch task progress for a specific task
  if (req.method === 'GET') {
    try {
      const taskProgress = await prisma.taskProgress.findMany({
        where: { taskId: parseInt(taskId) },
        include: { checklist: true },
        orderBy: { id: 'asc' }
      });
      
      return res.status(200).json(taskProgress);
    } catch (error) {
      console.error('Error fetching task progress:', error);
      return res.status(500).json({ message: 'Failed to fetch task progress' });
    }
  } 
  
  // POST: Create a new task progress entry
  else if (req.method === 'POST') {
    try {
      const { checklistId, checked, comment } = req.body;
      
      if (!checklistId) {
        return res.status(400).json({ message: 'Checklist ID is required' });
      }
      
      const newTaskProgress = await prisma.taskProgress.create({
        data: {
          taskId: parseInt(taskId),
          checklistId: checklistId,
          checked: checked || false,
          comment: comment || null,
          updatedAt: new Date()
        },
        include: {
          checklist: true
        }
      });
      
      return res.status(201).json(newTaskProgress);
    } catch (error) {
      console.error('Error creating task progress:', error);
      return res.status(500).json({ message: 'Failed to create task progress' });
    }
  } 
  
  // PUT: Update task progress entries
  else if (req.method === 'PUT') {
    try {
      const items = req.body;
      
      if (!Array.isArray(items)) {
        return res.status(400).json({ message: 'Expected array of task progress items' });
      }
      
      const updates = await Promise.all(items.map(async (item) => {
        return prisma.taskProgress.update({
          where: { id: item.id },
          data: {
            checked: item.checked,
            comment: item.comment,
            updatedAt: new Date()
          },
          include: { checklist: true }
        });
      }));
      
      return res.status(200).json(updates);
    } catch (error) {
      console.error('Error updating task progress:', error);
      return res.status(500).json({ message: 'Failed to update task progress' });
    }
  }
  
  // DELETE: Delete a task progress entry
  else if (req.method === 'DELETE') {
    try {
      const { progressId } = req.body;
      
      if (!progressId) {
        return res.status(400).json({ message: 'Progress ID is required' });
      }
      
      await prisma.taskProgress.delete({
        where: { id: progressId }
      });
      
      return res.status(200).json({ message: 'Task progress deleted successfully' });
    } catch (error) {
      console.error('Error deleting task progress:', error);
      return res.status(500).json({ message: 'Failed to delete task progress' });
    }
  }
  
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}