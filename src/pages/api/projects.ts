import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  // Check if user is logged in
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Check if user is admin or project manager
  if(!session.user || (session.user as any).role !== 'admin' && (session.user as any).role !== 'project_manager') {
    return res.status(403).json({ message: 'Forbidden: Admin or Project Manager access required' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getProjects(req, res);
    case 'POST':
      return createProject(req, res);
    case 'PUT':
      return updateProject(req, res);
    case 'DELETE':
      return deleteProject(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Function to get all projects
async function getProjects(req: NextApiRequest, res: NextApiResponse) {
  try {
    const projects = await prisma.project.findMany({
      include: {
        status: true,
        projectUsers: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                personnelId: true,
                photoUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format projects for frontend
    const formattedProjects = projects.map(project => ({
      id: project.id,
      projectName: project.projectName,
      projectCode: project.projectCode,
      projectOwner: project.projectOwner,
      startDate: project.startDate,
      endDate: project.endDate,
      status: {
        statusName: project.status.statusName
      },
      employees: project.projectUsers.map(pu => pu.user.name),
      createdAt: project.createdAt
    }));
  
    return res.status(200).json(formattedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
}

// Function to create a new project
async function createProject(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { projectName, projectCode, projectOwner, startDate, endDate, status, employees } = req.body;

    // Validate required inputs
    if(!projectName || !projectCode || !projectOwner || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get status ID based on status name
    const projectStatus = await prisma.projectStatus.findFirst({
      where: { 
        statusName: { 
          equals: status, 
          mode: 'insensitive' 
        } 
      }
    });

    if(!projectStatus) {
      return res.status(404).json({ message: 'Status not found' });
    }

    // Create new project
    const newProject = await prisma.project.create({
      data: {
        projectName,
        projectCode,
        projectOwner,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        statusId: projectStatus.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    // Create employee assignments if provided
    if(employees && employees.length > 0) {
      for(const employee of employees) {
        const user = await prisma.user.findFirst({
          where: { 
            name: { 
              equals: employee.employeeName, 
              mode: 'insensitive' 
            } 
          }
        });

        if(user) {
          await prisma.projectUser.create({
            data: {
              userId: user.id,
              projectId: newProject.id,
              position: employee.position || 'Member'
            }
          });
        }
      }
    }

    return res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
}

// Function to update an existing project
async function updateProject(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if(!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const { projectName, projectCode, projectOwner, startDate, endDate, status, employees } = req.body;

    // Get current project data
    const existingProject = await prisma.project.findUnique({
      where: { id: parseInt(id) }
    });

    if(!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get status ID if status is changing
    let statusId = existingProject.statusId;
    if(status) {
      const projectStatus = await prisma.projectStatus.findFirst({
        where: { 
          statusName: { 
            equals: status, 
            mode: 'insensitive' 
          } 
        }
      });

      if(!projectStatus) {
        return res.status(404).json({ message: 'Status not found' });
      }
      statusId = projectStatus.id;
    }

    // Update project in database
    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        projectName: projectName || existingProject.projectName,
        projectCode: projectCode || existingProject.projectCode,
        projectOwner: projectOwner || existingProject.projectOwner,
        startDate: startDate ? new Date(startDate) : existingProject.startDate,
        endDate: endDate ? new Date(endDate) : existingProject.endDate,
        statusId,
        updatedAt: new Date()
      }
    });

    // Update employee assignments if provided
    if(employees && employees.length > 0) {
      // First remove all existing project-user relations
      await prisma.projectUser.deleteMany({
        where: { projectId: parseInt(id) }
      });

      // Then add new project-user relations
      for(const employee of employees) {
        const user = await prisma.user.findFirst({
          where: { 
            name: { 
              equals: employee.employeeName, 
              mode: 'insensitive' 
            } 
          }
        });

        if(user) {
          await prisma.projectUser.create({
            data: {
              projectId: parseInt(id),
              userId: user.id,
              position: employee.position || 'Member'
            }
          });
        }
      }
    }

    return res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
}

// Function to delete a project
async function deleteProject(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Project ID is required' });
    }
    
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Use transaction to ensure all related records are deleted atomically
    await prisma.$transaction(async (tx) => {
      // Delete project-user relations first
      await tx.projectUser.deleteMany({
        where: { projectId: parseInt(id) }
      });
      
      // Then delete the project
      await tx.project.delete({
        where: { id: parseInt(id) }
      });
    });

    return res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
}