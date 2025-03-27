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
    return res.status(400).json({ message: 'Employee ID is required' });
  }

    if(!session.user || (session.user as any).role !== 'admin' && (session.user as any).role !== 'project_manager') {
      return res.status(403).json({ message: 'Forbidden: Admin or Project Manager access required' });
    }
    
  // Only allow GET requests for fetching employee tasks
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userRole = (session?.user as any)?.role;
    const loggedInUserId = (session?.user as any)?.id;
    
    // Convert the id to a number 
    const employeeId = parseInt(id);

    // Check if the user has permission to view these tasks
    // Allow if the user is viewing their own tasks, or is an admin/project manager
    if (
      userRole !== 'admin' && 
      userRole !== 'project_manager' && 
      loggedInUserId !== employeeId
    ) {
      return res.status(403).json({ 
        message: 'You do not have permission to view tasks for this employee' 
      });
    }

    // Get search query if provided
    const searchQuery = req.query.search as string || '';
    
    // Build search condition
    const whereCondition: any = {
      userId: employeeId // This ensures we only get tasks for the specific employee
    };
    
    // Add search filter if provided
    if (searchQuery) {
      whereCondition.taskName = { 
        contains: searchQuery, 
        mode: 'insensitive' 
      };
    }

    // Fetch tasks for the specified employee
    const tasks = await prisma.task.findMany({
      where: whereCondition,
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
      },
      orderBy: {
        dateAdded: 'desc'
      }
    });

    return res.status(200).json(tasks);
    
  } catch (error) {
    console.error('Error fetching employee tasks:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}