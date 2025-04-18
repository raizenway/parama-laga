import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { authOptions } from './auth/[...nextauth]';
import { AuthOptions } from 'next-auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions as AuthOptions);

  // Check if user is logged in
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

    // For GET requests, allow all authenticated users
    if (req.method === 'GET') {
      return getProjects(req, res);
    }

  // Check if user is admin or project manager
  if(!session.user || (session.user as any).role !== 'admin' && (session.user as any).role !== 'project_manager') {
    return res.status(403).json({ message: 'Forbidden: Admin or Project Manager access required' });
  }

  // Handle different HTTP methods
  switch (req.method) {
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
    const searchQuery = req.query.search as string || '';
    const session = await getServerSession(req, res, authOptions as AuthOptions);
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;
      // Build the search condition
      const searchCondition = searchQuery
      ? {
          projectName: { contains: searchQuery, mode: Prisma.QueryMode.insensitive }
        }
      : {};
    
    // Build the role-based condition
    const roleCondition: Record<string, any> = {};
    if (userRole !== 'admin' && userRole !== 'project_manager' && userId) {
      // Get only projects where this user is assigned
      roleCondition['projectUsers'] = {
        some: {
          userId: parseInt(userId.toString())
        }
      };
    }
        // Combine both conditions properly
        const whereCondition = {
          ...searchCondition,
          ...roleCondition
        };
        
    const projects = await prisma.project.findMany({
      where: whereCondition ,
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

    console.log('Creating project with data:', { projectName, projectCode, projectOwner, startDate, endDate, status });
    console.log('Employees:', employees);

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
      return res.status(404).json({ 
        message: `Status "${status}" not found. Available statuses: Pending, Ongoing, Completed, Delayed` 
      });
    }

    try {
      // Use a transaction to ensure data consistency
      let projectId: number = -1; // Initialize with a default value
      await prisma.$transaction(async (tx) => {
        // Create new project
        const project = await tx.project.create({
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
        
        projectId = project.id;

        // Create employee assignments if provided
        if(employees && Array.isArray(employees) && employees.length > 0) {
          for(const employee of employees) {
            if (!employee.employeeName) {
              console.warn('Skipping employee assignment without name:', employee);
              continue;
            }

            const user = await tx.user.findFirst({
              where: { 
                name: { 
                  equals: employee.employeeName, 
                  mode: 'insensitive' 
                } 
              }
            });

            if(user) {
              await tx.projectUser.create({
                data: {
                  userId: user.id,
                  projectId: project.id
                }
              });
            } else {
              console.warn(`User ${employee.employeeName} not found, skipping assignment.`);
            }
          }
        }
      });

      // Fetch the created project after transaction completes
      const newProject = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          status: true,
          projectUsers: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  personnelId: true
                }
              }
            }
          }
        }
      });

      // Format response object - similar to what you do in updateProject
      const response = newProject ? {
        id: newProject.id,
        projectName: newProject.projectName,
        projectCode: newProject.projectCode,
        projectOwner: newProject.projectOwner,
        startDate: newProject.startDate,
        endDate: newProject.endDate,
        status: newProject.status.statusName,
        employees: newProject.projectUsers.map(pu => ({
          employeeName: pu.user.name
        }))
      } : { message: 'Project created but could not retrieve details' };

      return res.status(201).json(response);
      
    } catch (txError) {
      console.error('Transaction error:', txError);
      return res.status(500).json({ 
        message: 'Error creating project data', 
        error: txError instanceof Error ? txError.message : 'Unknown transaction error' 
      });
    }
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Internal server error',
      error 
    });
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
    
    console.log('Updating project with ID:', id);
    console.log('Update data:', { projectName, projectCode, projectOwner, startDate, endDate, status });
    console.log('Employees:', employees);

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
        return res.status(404).json({ 
          message: `Status "${status}" not found. Available statuses: Pending, Ongoing, Completed, Delayed` 
        });
      }
      statusId = projectStatus.id;
    }

    try {
      // Use a transaction to ensure data consistency
      await prisma.$transaction(async (tx) => {
        // Update project in database
        await tx.project.update({
          where: { id: parseInt(id) },
          data: {
            projectName: projectName !== undefined ? projectName : existingProject.projectName,
            projectCode: projectCode !== undefined ? projectCode : existingProject.projectCode,
            projectOwner: projectOwner !== undefined ? projectOwner : existingProject.projectOwner,
            startDate: startDate ? new Date(startDate) : existingProject.startDate,
            endDate: endDate ? new Date(endDate) : existingProject.endDate,
            statusId,
            updatedAt: new Date()
          }
        });

        // Update employee assignments if provided
        if(employees && Array.isArray(employees)) {
          // First remove all existing project-user relations
          await tx.projectUser.deleteMany({
            where: { projectId: parseInt(id) }
          });

          // Then add new project-user relations
          for(const employee of employees) {
            if (!employee.employeeName) {
              console.warn('Skipping employee assignment without name:', employee);
              continue;
            }
            
            const user = await tx.user.findFirst({
              where: { 
                name: { 
                  equals: employee.employeeName, 
                  mode: 'insensitive' 
                } 
              }
            });

            if(user) {
              await tx.projectUser.create({
                data: {
                  projectId: parseInt(id),
                  userId: user.id,
                }
              });
            } else {
              console.warn(`User ${employee.employeeName} not found, skipping assignment.`);
            }
          }
        }
      });

      // Fetch the updated project after transaction is complete
      const updatedProject = await prisma.project.findUnique({
        where: { id: parseInt(id) },
        include: {
          status: true,
          projectUsers: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  personnelId: true
                }
              }
            }
          }
        }
      });

      // Format response object
      const response = updatedProject ? {
        id: updatedProject.id,
        projectName: updatedProject.projectName,
        projectCode: updatedProject.projectCode,
        projectOwner: updatedProject.projectOwner,
        startDate: updatedProject.startDate,
        endDate: updatedProject.endDate,
        status: updatedProject.status.statusName,
        employees: updatedProject.projectUsers.map(pu => ({
          employeeName: pu.user.name
        }))
      } : { message: 'Project updated but could not retrieve details' };

      return res.status(200).json(response);
    } catch (txError) {
      console.error('Transaction error:', txError);
      return res.status(500).json({ 
        message: 'Error updating project data', 
        error: txError instanceof Error ? txError.message : 'Unknown transaction error' 
      });
    }
  } catch (error) {
    console.error('Error handling update request:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
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
      // Find tasks related to this project
      const tasks = await tx.task.findMany({
        where: { projectId: parseInt(id) }
      });
      
      // For each task, delete associated task progress entries
      for (const task of tasks) {
        await tx.taskProgress.deleteMany({
          where: { taskId: task.id }
        });
      }
      
      // Delete tasks related to this project
      await tx.task.deleteMany({
        where: { projectId: parseInt(id) }
      });
      
      // Delete project-user relations
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