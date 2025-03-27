import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  // Check if user is logged in
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // Check if user is admin or project manager - you can customize this according to your needs
  if (session.user && ((session.user as any).role === 'admin' || (session.user as any).role === 'project_manager')) {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    try {
      console.log(`Fetching employee with ID: ${id}`);
      // Fetch a specific employee by ID
      const employee = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: {
          roleAccess: true,
          projectUsers: {
            include: {
              project: {
                select: {
                  id: true,
                  projectName: true,
                  projectCode: true
                }
              }
            }
          }
        }
      });

      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      // Format the employee data for the frontend
      const formattedEmployee = {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        personnelId: employee.personnelId,
        photoUrl: employee.photoUrl,
        role: employee.role || 'No role assigned',
        status: employee.status,
        roleAccess: employee.roleAccess?.roleName || 'No access role',
        projects: employee.projectUsers.map(pu => pu.project.projectName),
        dateAdded: employee.createdAt
      };

      return res.status(200).json(formattedEmployee);
    } catch (error) {
      console.error('Error fetching employee:', error);
      return res.status(500).json({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  } else {
    return res.status(403).json({ message: 'Forbidden: Admin or Project Manager access required' });
  }
}