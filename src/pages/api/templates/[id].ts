import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { AuthOptions } from 'next-auth';
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as AuthOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { id } = req.query;
  const templateId = parseInt(id as string);

  if (isNaN(templateId)) {
    return res.status(400).json({ message: 'Invalid template ID' });
  }

  if (req.method === 'GET') {
    try {
      const template = await prisma.taskTemplate.findUnique({
        where: { id: templateId },
        include: {
          templateChecklists: {
            include: {
              checklist: true
            }
          }
        }
      });
      
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
      
      return res.status(200).json(template);
    } catch (error) {
      console.error('Error fetching template:', error);
      return res.status(500).json({ message: 'Failed to fetch template' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { templateName, checklistIds } = req.body;
      
      if (!templateName) {
        return res.status(400).json({ message: 'Template name is required' });
      }
      
      // Update template
      const template = await prisma.taskTemplate.update({
        where: { id: templateId },
        data: {
          templateName,
          updatedAt: new Date(),
        }
      });
      
      // Delete existing template-checklist associations
      await prisma.templateChecklist.deleteMany({
        where: { templateId }
      });
      
      // Create new template-checklist associations
      if (checklistIds && checklistIds.length > 0) {
        await Promise.all(checklistIds.map((checklistId: string) => 
          prisma.templateChecklist.create({
            data: {
              templateId,
              checklistId: parseInt(checklistId)
            }
          })
        ));
      }
      
      return res.status(200).json(template);
    } catch (error) {
      console.error('Error updating template:', error);
      return res.status(500).json({ message: 'Failed to update template' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // First delete all template-checklist associations
      await prisma.templateChecklist.deleteMany({
        where: { templateId }
      });
      
      // Then delete the template
      await prisma.taskTemplate.delete({
        where: { id: templateId }
      });
      
      return res.status(200).json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Error deleting template:', error);
      return res.status(500).json({ message: 'Failed to delete template' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}