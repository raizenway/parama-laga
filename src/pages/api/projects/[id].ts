import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Project ID is required' });
  }

  if(!session.user || (session.user as any).role !== 'admin' && (session.user as any).role !== 'project_manager') {
    return res.status(403).json({ message: 'Forbidden: Admin or Project Manager access required' });
  }

  // Handle GET request - fetch a specific project
  if (req.method === 'GET') {
    try {
      // Fetch project data
      const project = await prisma.project.findUnique({
        where: { id: parseInt(id) },
        include: {
          status: true,
          projectUsers: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  personnelId: true,
                  photoUrl: true,
                  role: true,
                  status: true
                }
              }
            }
          }
        }
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Format project data for frontend
      const formattedProject = {
        id: project.id,
        projectName: project.projectName,
        projectCode: project.projectCode,
        projectOwner: project.projectOwner,
        startDate: project.startDate,
        endDate: project.endDate,
        status: {
          statusName: project.status.statusName
        },
        employees: project.projectUsers.map(pu => pu.user.name),
        users: project.projectUsers.map(pu => ({
          id: pu.user.id,
          name: pu.user.name,
          email: pu.user.email,
          personnelId: pu.user.personnelId,
          photoUrl: pu.user.photoUrl,
          role: pu.user.role,
          status: pu.user.status
        }))
      };

      return res.status(200).json(formattedProject);
    } catch (error) {
      console.error('Error fetching project:', error);
      return res.status(500).json({ 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  } 

  // Method not allowed
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}