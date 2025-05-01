import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]';
import { AuthOptions } from 'next-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as AuthOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { projectId : idProject, weekId :   idWeek } = req.query;
  
  if (!idProject || typeof idProject !== 'string') {
    return res.status(400).json({ message: 'Project ID is required' });
  }
  if (!idWeek || typeof idWeek !== 'string') {
    return res.status(400).json({ message: 'Week ID is required' });
  }

  const projectId = parseInt(idProject);
  const weekId = parseInt(idWeek);

  if (req.method === 'DELETE') {
    try {
      if (isNaN(weekId)) {
        return res.status(400).json({ message: 'Week ID is required and must be a valid number' });
      }
      
      // Gunakan deleteMany untuk menghapus berdasarkan id dan projectId
      const deleteResult = await prisma.activityWeek.deleteMany({
        where: {
          id: weekId,
          projectId: projectId,
        },
      });
      
      if (deleteResult.count === 0) {
        return res.status(404).json({ message: 'Activity week not found or project mismatch' });
      }
      
      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting activity week:', error);
      return res.status(500).json({ message: 'Failed to delete activity week' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}