import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { AuthOptions } from 'next-auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions as AuthOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const searchQuery = req.query.search as string || '';
      
      // Build search condition
      const whereCondition = searchQuery
      ?{
        templateName:{ contains: searchQuery, mode: Prisma.QueryMode.insensitive }
      }
      :{};
      const templates = await prisma.taskTemplate.findMany({
        where:whereCondition,
        include: {
          templateChecklists: {
            include: {
              checklist: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return res.status(200).json(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      return res.status(500).json({ message: 'Failed to fetch templates' });
    }
  } else if (req.method === 'POST') {
    if(!session.user || (session.user as any).role !== 'admin' && (session.user as any).role !== 'project_manager') {
      return res.status(403).json({ message: 'Forbidden: Admin or Project Manager access required' });
    }  
    try {
      const { templateName, checklistIds } = req.body;
      
      if (!templateName) {
        return res.status(400).json({ message: 'Template name is required' });
      }
      
      // Create template
      const template = await prisma.taskTemplate.create({
        data: {
          templateName,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      
      // Create template-checklist associations
      if (checklistIds && checklistIds.length > 0) {
        await Promise.all(checklistIds.map((checklistId: string) => 
          prisma.templateChecklist.create({
            data: {
              templateId: template.id,
              checklistId: parseInt(checklistId)
            }
          })
        ));
      }
      
      return res.status(201).json(template);
    } catch (error) {
      console.error('Error creating template:', error);
      return res.status(500).json({ message: 'Failed to create template' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}