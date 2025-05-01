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
  
    if(!session.user || (session.user as any).role !== 'admin' && (session.user as any).role !== 'project_manager') {
      return res.status(403).json({ message: 'Forbidden: Admin or Project Manager access required' });
    }

  // Only allow GET requests for fetching project tasks
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get search query if provided
    const searchQuery = req.query.search as string || '';
    
    // Build search condition
    const whereCondition: any = {
      projectId: parseInt(id) // This ensures we only get tasks for the specific project
    };
    
    // Add search filter if provided
    if (searchQuery) {
      whereCondition.taskName = { 
        contains: searchQuery, 
        mode: 'insensitive' 
      };
    }

    // Fetch tasks for the specified project
    const tasks = await prisma.task.findMany({
      where: whereCondition,
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
      },
      orderBy: {
        dateAdded: 'desc'
      }
    });

    return res.status(200).json(tasks);
    
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}