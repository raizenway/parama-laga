import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const checklists = await prisma.checklist.findMany({
        orderBy: {
          criteria: 'asc'
        }
      });
      
      return res.status(200).json(checklists);
    } catch (error) {
      console.error('Error fetching checklists:', error);
      return res.status(500).json({ message: 'Failed to fetch checklists' });
    }
  } else if (req.method === 'POST') {
    try {
      const { criteria } = req.body;
      
      if (!criteria) {
        return res.status(400).json({ message: 'Checklist criteria is required' });
      }
      
      const checklist = await prisma.checklist.create({
        data: {
          criteria,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      
      return res.status(201).json(checklist);
    } catch (error) {
      console.error('Error creating checklist:', error);
      return res.status(500).json({ message: 'Failed to create checklist' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}