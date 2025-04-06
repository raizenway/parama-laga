import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const userId = (session.user as any).id;
  
  // POST: Create a new activity result
  if (req.method === 'POST') {
    try {
      const { itemId, result, comment } = req.body;
      
      if (!itemId) {
        return res.status(400).json({ message: 'Item ID is required' });
      }
      
      // Check if user has permission to add results to this item
      const item = await prisma.activityItem.findUnique({
        where: { id: parseInt(itemId) },
        include: {
          category: true
        }
      });
      
      if (!item) {
        return res.status(404).json({ message: 'Activity item not found' });
      }
      
      const newResult = await prisma.activityResult.create({
        data: {
          itemId: parseInt(itemId),
          result,
          comment,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      return res.status(201).json(newResult);
    } catch (error) {
      console.error('Error creating activity result:', error);
      return res.status(500).json({ message: 'Failed to create activity result' });
    }
  }
  
  // PUT: Update an activity result
  else if (req.method === 'PUT') {
    try {
      const { id, result, comment } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: 'Result ID is required' });
      }
      
      // Check if user has permission to update this result
      const existingResult = await prisma.activityResult.findUnique({
        where: { id: parseInt(id) },
        include: {
          item: {
            include: {
              category: true
            }
          }
        }
      });
      
      if (!existingResult) {
        return res.status(404).json({ message: 'Activity result not found' });
      }
      
      const updatedResult = await prisma.activityResult.update({
        where: { id: parseInt(id) },
        data: {
          result,
          comment,
          updatedAt: new Date()
        }
      });
      
      return res.status(200).json(updatedResult);
    } catch (error) {
      console.error('Error updating activity result:', error);
      return res.status(500).json({ message: 'Failed to update activity result' });
    }
  }
  
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}