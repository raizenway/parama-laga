import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]';
import { AuthOptions } from 'next-auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions as AuthOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

    if(!session.user || (session.user as any).role !== 'admin' && (session.user as any).role !== 'project_manager') {
      return res.status(403).json({ message: 'Forbidden: Admin or Project Manager access required' });
    }
    
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Employee ID is required' });
  }

  try {
    // Get projects where the employee is assigned
    const projectUsers = await prisma.projectUser.findMany({
      where: {
        userId: parseInt(id)
      },
      include: {
        project: {
          include: {
            status: true
          }
        }
      }
    });

    // Format the response
    const projects = projectUsers.map(pu => ({
      id: pu.project.id.toString(),
      projectName: pu.project.projectName,
      projectCode: pu.project.projectCode,
      projectOwner: pu.project.projectOwner,
      startDate: pu.project.startDate,
      endDate: pu.project.endDate,
      status: {
        statusName: pu.project.status.statusName
      }
    }));

    return res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching employee projects:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}