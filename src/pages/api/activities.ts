import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { AuthOptions } from 'next-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as AuthOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;
  
  // GET: Fetch activities with filtering options
  if (req.method === 'GET') {
    try {
      const { projectId, weekId, employeeId } = req.query;
      
      // Jika tidak diberikan weekId, fetch berdasarkan ActivityWeek beserta kategori di dalamnya
      if (!weekId) {
        // Filter project jika tersedia
        const weekWhereClause: any = {};
        if (projectId && typeof projectId === 'string') {
          weekWhereClause.projectId = parseInt(projectId);
        }
        
        let filterEmployeeId: number | undefined;
        if (userRole === 'admin' || userRole === 'project_manager') {
          if (employeeId && typeof employeeId === 'string') {
            filterEmployeeId = parseInt(employeeId);
          }
        } else {
          filterEmployeeId = parseInt(userId);
        }
        
        const weeks = await prisma.activityWeek.findMany({
          where: weekWhereClause,
          include: {
            project: true,
            categories: {
              ...(filterEmployeeId ? { where: { userId: filterEmployeeId } } : {}),
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    personnelId: true
                  }
                },
                project: true,
                items: {
                  include: {
                    results: true
                  },
                  orderBy: { createdAt: 'asc' }
                }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        });
        
        return res.status(200).json(weeks);
      } else {
        // Jika weekId disediakan, gunakan query di ActivityCategory seperti sebelumnya
        const whereClause: any = {};
      
        if (projectId && typeof projectId === 'string') {
          whereClause.projectId = parseInt(projectId);
        }
        
        if (weekId && typeof weekId === 'string') {
          whereClause.weekId = parseInt(weekId);
        }
        
        if (userRole === 'admin' || userRole === 'project_manager') {
          if (employeeId && typeof employeeId === 'string') {
            whereClause.userId = parseInt(employeeId);
          }
        } else {
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
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        });
        
        return res.status(200).json(categories);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      return res.status(500).json({ message: 'Failed to fetch activities' });
    }
  }
  
// POST: Create a new activity category
else if (req.method === 'POST') {
  try {
    const { projectId, weekId, name, userId: requestUserId } = req.body;
    
    if (!projectId || !weekId || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Use the userId from the request body if provided and user is admin/PM
    // Otherwise use the current user's ID from the session
    let effectiveUserId = parseInt(userId);
    
    if ((userRole === 'admin' || userRole === 'project_manager') && requestUserId) {
      effectiveUserId = parseInt(requestUserId);
    }
    
    const newCategory = await prisma.activityCategory.create({
      data: {
        userId: effectiveUserId,
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
else if(req.method === 'DELETE'){
    try {
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid or missing ID' });
      }
      
      // Delete the category. Ensure cascade delete is configured in your schema if needed.
      const deletedCategory = await prisma.activityCategory.delete({
        where: { id: parseInt(id) }
      });
      return res.status(200).json(deletedCategory);
    } catch (error) {
      console.error('Error deleting activity category:', error);
      return res.status(500).json({ message: 'Failed to delete activity category' });
    }
  }
  
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}