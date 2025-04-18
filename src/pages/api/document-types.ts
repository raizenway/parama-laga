import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { PrismaClient, Prisma } from '@prisma/client';
import { authOptions } from './auth/[...nextauth]';
import { AuthOptions } from 'next-auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as AuthOptions);

  // Check if user is logged in
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  if (req.method === 'GET') {
    return getDocumentTypes(req, res);
  }

  if(!session.user || (session.user as any).role !== 'admin' && (session.user as any).role !== 'project_manager') {
    return res.status(403).json({ message: 'Forbidden: Admin or Project Manager access required' });
  }


  switch (req.method) {
    case 'POST':
      return createDocumentType(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Function to get all document types
async function getDocumentTypes(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, search } = req.query;
    
    // If ID is provided, fetch a specific document type
    if (id) {
      const documentType = await prisma.documentType.findUnique({
        where: { id: parseInt(id as string) }
      });

      if (!documentType) {
        return res.status(404).json({ message: 'Document type not found' });
      }

      return res.status(200).json(documentType);
    }

    // Build search condition
    const searchQuery = search as string || '';
    const whereCondition = searchQuery
      ? {
          name: { contains: searchQuery, mode: Prisma.QueryMode.insensitive }
        }
      : {};

    // Fetch all document types with filtering
    const documentTypes = await prisma.documentType.findMany({
      where: whereCondition,
      orderBy: {
        name: 'asc'
      }
    });

    return res.status(200).json(documentTypes);
  } catch (error) {
    console.error('Error fetching document types:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
}

// Function to create a new document type
async function createDocumentType(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Document type name is required' });
    }

    // Check if document type with the same name already exists
    const existingDocType = await prisma.documentType.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (existingDocType) {
      return res.status(409).json({ message: 'Document type with this name already exists' });
    }

    const documentType = await prisma.documentType.create({
      data: { name }
    });

    return res.status(201).json(documentType);
  } catch (error) {
    console.error('Error creating document type:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
}