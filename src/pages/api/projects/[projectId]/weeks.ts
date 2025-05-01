import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]';
import { AuthOptions } from 'next-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as AuthOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { projectId: id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Project ID is required' });
  }
  
  const projectId = parseInt(id);
  
// GET: Fetch weeks for a project
if (req.method === 'GET') {
  try {
    const { employeeId } = req.query;
    
    let weeks;
    
    // If employeeId is provided, only return weeks that have activities for this employee
    if (employeeId && typeof employeeId === 'string') {
      // First get all activity categories for this employee in this project
      const employeeCategories = await prisma.activityCategory.findMany({
        where: {
          projectId,
          userId: parseInt(employeeId),
        },
        select: {
          weekId: true
        },
        distinct: ['weekId']
      });
      
      // Extract the week IDs
      const weekIds = employeeCategories.map(category => category.weekId);
      
      // Then get the actual weeks
      weeks = await prisma.activityWeek.findMany({
        where: { 
          projectId,
          id: { in: weekIds }
        },
        orderBy: { weekNum: 'desc' }
      });
    } else {
      // If no employeeId, return all weeks for the project
      weeks = await prisma.activityWeek.findMany({
        where: { projectId },
        orderBy: { weekNum: 'desc' }
      });
    }
    
    return res.status(200).json(weeks);
  } catch (error) {
    console.error('Error fetching activity weeks:', error);
    return res.status(500).json({ message: 'Failed to fetch activity weeks' });
  }
}
  
 // POST: Create a new week for a project
else if (req.method === 'POST') {
  try {
    const { startDate, endDate, weekNum, copyFromPreviousWeek = true, employeeId, fromCustomWeek} = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }

    if (fromCustomWeek === false) {
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
        // Get categories from the previous week, filtered by employee if specified
        const whereClause: any = { 
          weekId: latestWeek.id,
          projectId
        };
        
        // If employeeId is provided, only copy for that employee
        if (employeeId) {
          whereClause.userId = parseInt(employeeId);
        }
        
        const previousCategories = await prisma.activityCategory.findMany({
          where: whereClause,
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
      // console.log("Post from non-custom Week", nextWeekNum);
    return res.status(201).json(newWeek);  
    }
      else{
        // Create new week without copying from previous week
        const newWeek = await prisma.activityWeek.create({
          data: {
            projectId,
            weekNum,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        // console.log("Posted from Custom Week", weekNum);
        return res.status(201).json(newWeek);
      }
      
    } catch (error) {
      console.error('Error creating activity week:', error);
      return res.status(500).json({ message: 'Failed to create activity week' });
    }
  }
}