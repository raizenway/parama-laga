import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { AuthOptions } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as AuthOptions);
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  const { id } = req.query;
  if (!id || Array.isArray(id))
    return res.status(400).json({ message: 'Category ID is required' });

  if (req.method === 'DELETE') {
    try {
      // Hapus kategori activity, pastikan pengaturan cascade delete sudah dikonfigurasi jika diperlukan.
      const deletedCategory = await prisma.activityCategory.delete({
        where: { id: parseInt(id) },
      });
      return res.status(200).json(deletedCategory);
    } catch (error) {
      console.error('Error deleting activity category:', error);
      return res.status(500).json({ message: 'Failed to delete activity category' });
    }
  }
  res.setHeader('Allow', ['DELETE']);
  return res.status(405).json({ message: 'Method not allowed' });
}