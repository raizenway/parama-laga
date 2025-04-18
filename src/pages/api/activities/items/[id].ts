import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { AuthOptions } from 'next-auth';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as AuthOptions);
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  const { id } = req.query;
  if (!id || Array.isArray(id))
    return res.status(400).json({ message: 'Item ID is required' });

  if (req.method === 'DELETE') {
    try {
      const deletedItem = await prisma.activityItem.delete({
        where: { id: parseInt(id) },
      });
      return res.status(200).json(deletedItem);
    } catch (error) {
      console.error('Error deleting activity item:', error);
      return res.status(500).json({ message: 'Failed to delete activity item' });
    }
  }
  res.setHeader('Allow', ['DELETE']);
  return res.status(405).json({ message: 'Method not allowed' });
}