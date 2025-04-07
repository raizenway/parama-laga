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
  
  // POST: Create a new activity item
  if (req.method === 'POST') {
    try {
      const { categoryId, name } = req.body;
      
      if (!categoryId || !name) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Check if user has permission to add items to this category
      const category = await prisma.activityCategory.findUnique({
        where: { id: parseInt(categoryId) }
      });
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      
      const newItem = await prisma.activityItem.create({
        data: {
          categoryId: parseInt(categoryId),
          name,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      return res.status(201).json(newItem);
    } catch (error) {
      console.error('Error creating activity item:', error);
      return res.status(500).json({ message: 'Failed to create activity item' });
    }
  }
  
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}