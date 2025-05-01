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
    
  // Only allow GET requests for fetching project employees
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get search query if provided
    const searchQuery = req.query.search as string || '';
    
    // Get project users with their associated user information
    const projectUsers = await prisma.projectUser.findMany({
      where: { 
        projectId: parseInt(id) 
      },
      include: {
        user: {
          include: {
            roleAccess: true
          }
        }
      }
    });
    
    // Format the employees data for the frontend
    const employees = projectUsers.map(pu => ({
      id: pu.user.id,
      name: pu.user.name,
      email: pu.user.email,
      personnelId: pu.user.personnelId,
      photoUrl: pu.user.photoUrl,
      role: pu.user.role || 'No role assigned',
      status: pu.user.status,
      roleAccess: pu.user.roleAccess?.roleName || 'No access role'
    }));

    // Apply search filter if provided
    const filteredEmployees = searchQuery
      ? employees.filter(emp => 
          (emp.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (emp.email ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (emp.personnelId ?? '').toLowerCase().includes(searchQuery.toLowerCase())
        )
      : employees;

    return res.status(200).json(filteredEmployees);
    
  } catch (error) {
    console.error('Error fetching project employees:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}