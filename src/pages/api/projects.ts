import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  // Cek apakah user sudah login
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Hanya mendukung metode GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Ambil data user berdasarkan email dari session
    const user = await prisma.user.findUnique({
      where: {
        email: session.user?.email as string || ''
      },
      include: {
        projectUsers: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Admin melihat semua project
    if (user.role?.roleName === 'admin') {
      const projects = await prisma.project.findMany({
        include: {
          status: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      console.log('projects:', projects);
      return res.status(200).json(projects);
    }

    // User lain hanya melihat project yang mereka ikuti
    const projectIds = user.projectUsers.map(pu => pu.projectId);
    
    const projects = await prisma.project.findMany({
      where: {
        id: {
          in: projectIds
        }
      },
      include: {
        status: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
}