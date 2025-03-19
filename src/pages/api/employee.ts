import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from './auth/[...nextauth]';
import { hash } from 'bcrypt';

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

    // Handle various HTTP methods
    switch (req.method) {
        case 'GET':
            return getEmployees(req, res);
        case 'POST':
            return createEmployee(req, res);
        case 'PUT':
            return updateEmployee(req, res);
        case 'DELETE':
            return deleteEmployee(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
}

// Function to get all employees
async function getEmployees(req: NextApiRequest, res: NextApiResponse) {
    try {
        const employees = await prisma.user.findMany({
            include: {
                role: {
                    select: {
                        roleName: true
                    }
                },
                projectUsers: {
                    include: {
                        project: {
                            select: {
                                projectName: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Format data for frontend
        const formattedEmployees = employees.map(employee => ({
            id: employee.id,
            name: employee.name,
            email: employee.email,
            personnelId: employee.personnelId,
            photoUrl: employee.photoUrl,
            position: employee.role?.roleName,
            status: employee.status, // Include status field
            projects: employee.projectUsers.map(pu => pu.project.projectName),
            dateAdded: employee.createdAt
        }));
    
        return res.status(200).json(formattedEmployees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}

// Function to create a new employee
async function createEmployee(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { name, email, personnelId, password, position, status, projects, photoUrl } = req.body;

        // Validate required inputs
        if(!name || !email || !personnelId || !password || !position) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate status
        if(status !== 'active' && status !== 'inactive') {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Check if email is already in use
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if(existingUser) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        // Get role ID based on position name
        const role = await prisma.role.findFirst({
            where: { 
                roleName: { 
                    equals: position.toLowerCase(), 
                    mode: 'insensitive' 
                } 
            }
        });

        if(!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Hash password
        const hashedPassword = await hash(password, 10);

        // Create new user with status
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                personnelId,
                password: hashedPassword,
                roleId: role.id,
                photoUrl: photoUrl || null,
                status: status, // Set the status field
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        });

        // Create project relationships if provided
        if(projects && projects.length > 0) {
            for(const project of projects) {
                const existingProject = await prisma.project.findFirst({
                    where: { 
                        projectName: { 
                            equals: project.projectName, 
                            mode: 'insensitive' 
                        } 
                    }
                });

                if(existingProject) {
                    await prisma.projectUser.create({
                        data: {
                            userId: newUser.id,
                            projectId: existingProject.id,
                            position: project.position || 'Member'
                        }
                    });
                }
            }
        }

        // Return new user (without password)
        const { password: _, ...userWithoutPassword } = newUser;
        return res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Error creating employee:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}

// Function to update an existing employee
async function updateEmployee(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;
        
        if(!id || typeof id !== 'string') {
            return res.status(400).json({ message: 'Employee ID is required' });
        }

        const { name, email, personnelId, password, position, status, projects, photoUrl } = req.body;

        // Validate status if provided
        if(status && status !== 'active' && status !== 'inactive') {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Get current user data
        const existingUser = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: {
                role: true
            }
        });

        if(!existingUser) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Check if email is being changed and if it's already in use
        if(email && email !== existingUser.email) {
            const emailExists = await prisma.user.findUnique({
                where: { email }
            });

            if(emailExists) {
                return res.status(409).json({ message: 'Email already in use' });
            }
        }

        // Get role ID if position is changing
        let roleId = existingUser.roleId;
        if(position) {
            const role = await prisma.role.findFirst({
                where: { 
                    roleName: { 
                        equals: position.toLowerCase(), 
                        mode: 'insensitive' 
                    } 
                }
            });

            if(!role) {
                return res.status(404).json({ message: 'Role not found' });
            }
            roleId = role.id;
        }

        // Update user data
        const updateData: any = {
            name: name || existingUser.name,
            email: email || existingUser.email,
            personnelId: personnelId || existingUser.personnelId,
            roleId,
            status: status || existingUser.status, // Update status if provided
            photoUrl: photoUrl || existingUser.photoUrl,
            updatedAt: new Date()
        };

        // Only update password if provided
        if(password) {
            updateData.password = await hash(password, 10);
        }

        // Update user in database
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        // Update project relations if provided
        if(projects && projects.length > 0) {
            // First remove all existing project relations
            await prisma.projectUser.deleteMany({
                where: { userId: parseInt(id) }
            });

            // Then add new project relations
            for(const project of projects) {
                const existingProject = await prisma.project.findFirst({
                    where: { 
                        projectName: { 
                            equals: project.projectName, 
                            mode: 'insensitive' 
                        } 
                    }
                });

                if(existingProject) {
                    await prisma.projectUser.create({
                        data: {
                            userId: parseInt(id),
                            projectId: existingProject.id,
                            position: project.position || 'Member'
                        }
                    });
                }
            }
        }

        // Return updated user (without password)
        const { password: _, ...userWithoutPassword } = updatedUser;
        return res.status(200).json(userWithoutPassword);
    } catch (error) {
        console.error('Error updating employee:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}

// Function to delete an employee
async function deleteEmployee(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;
        
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: 'Employee ID is required' });
        }
        
        // Check if employee exists
        const employee = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Use transaction to ensure all related records are deleted atomically
        await prisma.$transaction(async (tx) => {
            // Delete sessions first
            await tx.session.deleteMany({
                where: { userId: parseInt(id) }
            });

            // Delete project_users relations
            await tx.projectUser.deleteMany({
                where: { userId: parseInt(id) }
            });
            
            // Finally delete the user
            await tx.user.delete({
                where: { id: parseInt(id) }
            });
        });

        return res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}