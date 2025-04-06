import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;
  
  // GET: Fetch activities with filtering options
  if (req.method === 'GET') {
    try {
      const { projectId, weekId, employeeId } = req.query;
      
      let whereClause: any = {};
      
      // Filter by project
      if (projectId && typeof projectId === 'string') {
        whereClause.projectId = parseInt(projectId);
      }
      
      // Filter by week
      if (weekId && typeof weekId === 'string') {
        whereClause.weekId = parseInt(weekId);
      }
      
      // Filter by employee (only if admin or PM)
      if (userRole === 'admin' || userRole === 'project_manager') {
        if (employeeId && typeof employeeId === 'string') {
          whereClause.userId = parseInt(employeeId);
        }
      } else {
        // Regular employees can only see their own activities
        whereClause.userId = parseInt(userId);
      }
      
      const categories = await prisma.activityCategory.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              personnelId: true
            }
          },
          project: true,
          week: true,
          items: {
            include: {
              results: true
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        },
        orderBy: [
          { createdAt: 'asc' }
        ]
      });
      
      return res.status(200).json(categories);
    } catch (error) {
      console.error('Error fetching activities:', error);
      return res.status(500).json({ message: 'Failed to fetch activities' });
    }
  }
  
  // POST: Create a new activity category
  else if (req.method === 'POST') {
    try {
      const { projectId, weekId, name } = req.body;
      
      if (!projectId || !weekId || !name) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      const newCategory = await prisma.activityCategory.create({
        data: {
          userId: parseInt(userId),
          projectId: parseInt(projectId),
          weekId: parseInt(weekId),
          name,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              personnelId: true
            }
          },
          project: true,
          week: true,
          items: {
            include: {
              results: true
            }
          }
        }
      });
      
      return res.status(201).json(newCategory);
    } catch (error) {
      console.error('Error creating activity category:', error);
      return res.status(500).json({ message: 'Failed to create activity category' });
    }
  }
  
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}