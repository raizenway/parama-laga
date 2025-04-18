import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import { AuthOptions } from 'next-auth';
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as AuthOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // GET: Fetch all active users
  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        where: { status: 'active' },
        select: {
          id: true,
          name: true,
          email: true,
          personnelId: true,
          photoUrl: true,
          role: true
        },
        orderBy: { name: 'asc' }
      });
      
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}