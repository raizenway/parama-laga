import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { id } = req.query;
  const checklistId = parseInt(id as string);

  if (isNaN(checklistId)) {
    return res.status(400).json({ message: 'Invalid checklist ID' });
  }

  if (req.method === 'PUT') {
    try {
      const { criteria } = req.body;
      
      if (!criteria) {
        return res.status(400).json({ message: 'Checklist criteria is required' });
      }
      
      const checklist = await prisma.checklist.update({
        where: { id: checklistId },
        data: {
          criteria,
          updatedAt: new Date(),
        }
      });
      
      return res.status(200).json(checklist);
    } catch (error) {
      console.error('Error updating checklist:', error);
      return res.status(500).json({ message: 'Failed to update checklist' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Check if this checklist is being used in any template
      const checklistUsage = await prisma.templateChecklist.findFirst({
        where: { checklistId }
      });
      
      if (checklistUsage) {
        return res.status(400).json({ 
          message: 'This checklist is being used by one or more templates and cannot be deleted' 
        });
      }
      
      // Delete the checklist
      await prisma.checklist.delete({
        where: { id: checklistId }
      });
      
      return res.status(200).json({ message: 'Checklist deleted successfully' });
    } catch (error) {
      console.error('Error deleting checklist:', error);
      return res.status(500).json({ message: 'Failed to delete checklist' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}