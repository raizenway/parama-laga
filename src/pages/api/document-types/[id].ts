// filepath: [[id].ts](http://_vscodecontentref_/4)
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { PrismaClient }     from '@prisma/client'
import { AuthOptions } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient()
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req,res,authOptions as AuthOptions)
  if (!session) return res.status(401).end()

  const id = parseInt(req.query.id as string)
  if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" })

  if (req.method === "PUT") {
        try {
          const { id } = req.query;
          const { name } = req.body;
      
          if (!id) {
            return res.status(400).json({ message: 'Document type ID is required' });
          }
      
          if (!name) {
            return res.status(400).json({ message: 'Document type name is required' });
          }
      
          // Check if document type with the same name already exists (excluding current one)
          const existingDocType = await prisma.documentType.findFirst({
            where: { 
              AND: [
                { name: { equals: name, mode: 'insensitive' } },
                { id: { not: parseInt(id as string) } }
              ]
            }
          });
      
          if (existingDocType) {
            return res.status(409).json({ message: 'Document type with this name already exists' });
          }
      
          const documentType = await prisma.documentType.update({
            where: { id: parseInt(id as string) },
            data: { name }
          });
      
          return res.status(200).json(documentType);
        } catch (error) {
          console.error('Error updating document type:', error);
          return res.status(500).json({ message: 'Internal server error', error });
        }
  } else if (req.method === "DELETE") {
        try {
          const { id } = req.query;
      
          if (!id) {
            return res.status(400).json({ message: 'Document type ID is required' });
          }
      
          // Check if document type is being used by any task
          const tasksUsingDocType = await prisma.task.findFirst({
            where: { documentTypeId: parseInt(id as string) }
          });
      
          if (tasksUsingDocType) {
            return res.status(400).json({ 
              message: 'Cannot delete document type that is in use by tasks' 
            });
          }
      
          const documentType = await prisma.documentType.delete({
            where: { id: parseInt(id as string) }
          });
      
          return res.status(200).json(documentType);
        } catch (error) {
          console.error('Error deleting document type:', error);
          return res.status(500).json({ message: 'Internal server error', error });
        }
  } else {
    return res.status(405).end()
  }
}