import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Project ID is required' });
  }
  
  const projectId = parseInt(id);
  
  // GET: Fetch weeks for a project
  if (req.method === 'GET') {
    try {
      const weeks = await prisma.activityWeek.findMany({
        where: { projectId },
        orderBy: { weekNum: 'desc' }
      });
      
      return res.status(200).json(weeks);
    } catch (error) {
      console.error('Error fetching activity weeks:', error);
      return res.status(500).json({ message: 'Failed to fetch activity weeks' });
    }
  }
  
  // POST: Create a new week for a project
  else if (req.method === 'POST') {
    try {
      const { startDate, endDate, copyFromPreviousWeek = true } = req.body;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start and end dates are required' });
      }
      
      // Find the latest week number for this project
      const latestWeek = await prisma.activityWeek.findFirst({
        where: { projectId },
        orderBy: { weekNum: 'desc' }
      });
      
      const nextWeekNum = latestWeek ? latestWeek.weekNum + 1 : 1;
      
      // Create new week
      const newWeek = await prisma.activityWeek.create({
        data: {
          projectId,
          weekNum: nextWeekNum,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      // Copy categories and items if requested and if there's a previous week
      if (copyFromPreviousWeek && latestWeek) {
        // Get categories from the previous week
        const previousCategories = await prisma.activityCategory.findMany({
          where: { 
            weekId: latestWeek.id,
            projectId
          },
          include: {
            items: true
          }
        });
        
        // Copy each category and its items
        for (const category of previousCategories) {
          const newCategory = await prisma.activityCategory.create({
            data: {
              name: category.name,
              userId: category.userId,
              projectId: category.projectId,
              weekId: newWeek.id,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          
          // Copy items within the category (but not results)
          for (const item of category.items) {
            await prisma.activityItem.create({
              data: {
                name: item.name,
                categoryId: newCategory.id,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            });
          }
        }
      }
      
      return res.status(201).json(newWeek);
    } catch (error) {
      console.error('Error creating activity week:', error);
      return res.status(500).json({ message: 'Failed to create activity week' });
    }
  }
  
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}