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
    
    // Cek jika user bukan admin dan Project Manager
    if(!session.user || (session.user as any).role !== 'admin' && (session.user as any).role !== 'project_manager') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    // Handle untuk berbagai metode HTTP
    switch (req.method) {
        case 'GET':
            return getEmployees(req, res);
        case 'POST':
            return createEmployee(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
}

async function getEmployees(req: NextApiRequest, res: NextApiResponse) {
    try {
      const employees = await prisma.user.findMany({
        where: {
          role: {
            roleName: {
              notIn: ['admin', 'project_manager'] // Misalnya, kita tidak ingin menampilkan admin dalam daftar karyawan
            }
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          personnelId: true, // ID Karyawan
          photoUrl: true,
          role: {
            select: {
              roleName: true
            }
          },
          projectUsers: {
            select: {
              project: {
                select: {
                  projectName: true
                }
              }
            }
          },
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

          // Format data untuk frontend
    const formattedEmployees = employees.map(employee => ({
        id: employee.id,
        name: employee.name,
        email: employee.email,
        personnelId: employee.personnelId,
        photoUrl: employee.photoUrl,
        position: employee.role.roleName,
        projects: employee.projectUsers.map(pu => pu.project.projectName),
        dateAdded: employee.createdAt
      }));
  
      return res.status(200).json(formattedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      return res.status(500).json({ message: 'Internal server error', error });
    }
  }

// Fungsi untuk membuat karyawan baru (akan diimplementasikan nanti)
async function createEmployee(req: NextApiRequest, res: NextApiResponse) {
    // Implementasi untuk menambahkan karyawan baru akan ditambahkan di sini
    res.status(501).json({ message: 'Not implemented yet' });
  }