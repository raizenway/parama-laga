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
    return res.status(400).json({ message: 'Project ID is required' });
  }
  
  const projectId = parseInt(id);
  
  // GET: Fetch weeks for a project
  if (req.method === 'GET') {
    try {
      const weeks = await prisma.activityWeek.findMany({
        where: { projectId },
        orderBy: { weekNum: 'desc' }
      });
      
      return res.status(200).json(weeks);
    } catch (error) {
      console.error('Error fetching activity weeks:', error);
      return res.status(500).json({ message: 'Failed to fetch activity weeks' });
    }
  }
  
  // POST: Create a new week for a project
  else if (req.method === 'POST') {
    try {
      // Check if user is admin or project manager
      
      const { startDate, endDate } = req.body;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start and end dates are required' });
      }
      
      // Find the latest week number for this project
      const latestWeek = await prisma.activityWeek.findFirst({
        where: { projectId },
        orderBy: { weekNum: 'desc' }
      });
      
      const nextWeekNum = latestWeek ? latestWeek.weekNum + 1 : 1;
      
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
      
      return res.status(201).json(newWeek);
    } catch (error) {
      console.error('Error creating activity week:', error);
      return res.status(500).json({ message: 'Failed to create activity week' });
    }
  }
  
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}