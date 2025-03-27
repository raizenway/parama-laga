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
        const searchQuery = req.query.search as string ||'';
        //Build search condition
        const whereCondition = searchQuery
        ?{
            name:{contains : searchQuery, mode:'insensitive'},
        }
        :{};
        const employees = await prisma.user.findMany({
            where: whereCondition,
            include: {
                roleAccess: true, // Changed from role to roleAccess
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
        const formattedEmployees = employees.map(employee => {
            // Get project names
            const projectUsers = employee.projectUsers.map(pu => ({
                project: pu.project.projectName,
            }));
            
            return {
                id: employee.id,
                name: employee.name,
                email: employee.email,
                personnelId: employee.personnelId,
                photoUrl: employee.photoUrl,
                role: employee.role || 'No role assigned', // Use the new role field
                status: employee.status,
                roleAccess: employee.roleAccess?.roleName || 'No access role',
                projectUsers: projectUsers,
                projects: employee.projectUsers.map(pu => pu.project.projectName),
                dateAdded: employee.createdAt
            };
        });
    
        return res.status(200).json(formattedEmployees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}

// Function to create a new employee
async function createEmployee(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { name, email, personnelId, password, role, status, projects, photoUrl } = req.body;

        // Console log for debugging
        console.log("Creating employee with projects:", projects);

        // Validate required inputs
        if(!name || !email || !personnelId || !password) {
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

        // We need a default role access for new users (employee)
        const defaultRoleAccess = await prisma.roleAccess.findFirst({
            where: { roleName: 'employee' } // Changed from role to roleAccess
        });

        if(!defaultRoleAccess) {
            return res.status(404).json({ message: 'Default role access not found' });
        }

        // Hash password
        const hashedPassword = await hash(password, 10);

        // Create new user with status and role
        const newUser = await prisma.$transaction(async (tx) => {
            // Create the user first
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    personnelId,
                    password: hashedPassword,
                    roleId: defaultRoleAccess.id,
                    role: role || 'Employee',
                    photoUrl: photoUrl || null,
                    status: status,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            });

            // Create project relationships if provided
            if(projects && projects.length > 0) {
                for(const project of projects) {
                    // Handle both string and object formats
                    const projectName = typeof project === 'string' ? project : project.projectName;
                    console.log(`Looking for project: "${projectName}"`);
                    
                    const existingProject = await tx.project.findFirst({
                        where: { 
                            projectName: { 
                                equals: projectName, 
                                mode: 'insensitive' 
                            } 
                        }
                    });

                    if(existingProject) {
                        console.log(`Found project ID: ${existingProject.id}`);
                        await tx.projectUser.create({
                            data: {
                                userId: user.id,
                                projectId: existingProject.id,
                            }
                        });
                    } else {
                        console.log(`Project not found: ${projectName}`);
                    }
                }
            }
            
            return user;
        });
        // Return new user without password
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

        const { name, email, personnelId, password, role, status, projects, photoUrl } = req.body;

        console.log("Updating employee with projects:", projects);

        // Validate status if provided
        if(status && status !== 'active' && status !== 'inactive') {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Get current user data
        const existingUser = await prisma.user.findUnique({
            where: { id: parseInt(id) }
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

        // Use transaction for the entire update operation
        const updatedUser = await prisma.$transaction(async (tx) => {
            // Get current user data
            const existingUser = await tx.user.findUnique({
                where: { id: parseInt(id) }
            });

            if(!existingUser) {
                throw new Error('Employee not found');
            }

            // Update user data
            const updateData: any = {
                name: name || existingUser.name,
                email: email || existingUser.email,
                personnelId: personnelId || existingUser.personnelId,
                role: role || existingUser.role,
                status: status || existingUser.status,
                photoUrl: photoUrl || existingUser.photoUrl,
                updatedAt: new Date()
            };

            // Only update password if provided
            if(password) {
                updateData.password = await hash(password, 10);
            }

            // Update user in database
            const user = await tx.user.update({
                where: { id: parseInt(id) },
                data: updateData
            });

            // Update project relations if provided
            if(projects && projects.length > 0) {
                // First remove all existing project relations
                await tx.projectUser.deleteMany({
                    where: { userId: parseInt(id) }
                });

                // Then add new project relations
                for(const project of projects) {
                    const projectName = typeof project === 'string' ? project : project.projectName;
                    console.log(`Looking for project: "${projectName}"`);
                    
                    const existingProject = await tx.project.findFirst({
                        where: { 
                            projectName: { 
                                equals: projectName, 
                                mode: 'insensitive' 
                            } 
                        }
                    });

                    if(existingProject) {
                        console.log(`Found project ID: ${existingProject.id}`);
                        await tx.projectUser.create({
                            data: {
                                userId: parseInt(id),
                                projectId: existingProject.id,
                            }
                        });
                    } else {
                        console.log(`Project not found: ${projectName}`);
                    }
                }
            }
            
            return user;
        });

        // Return updated user without password
        const { password: _, ...userWithoutPassword } = updatedUser;
        return res.status(200).json(userWithoutPassword);
    } catch (error) {
        console.error('Error updating employee:', error);
        return res.status(500).json({ 
            message: error instanceof Error ? error.message : 'Internal server error', 
            error 
        });
    }
}

// Function to delete an employee
async function deleteEmployee(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;
        
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: 'Employee ID is required' });
        }
        
        console.log(`Attempting to delete employee with ID: ${id}`);
        
        // Check if employee exists
        const employee = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

                // Check if employee has associated tasks
                const associatedTasks = await prisma.task.findMany({
                    where: { userId: parseInt(id) }
                });
                
                if (associatedTasks.length > 0) {
                    return res.status(409).json({ 
                        message: 'Cannot delete employee because this employee is assigned to specific task(s)',
                        details: `This employee is assigned to ${associatedTasks.length} task(s). Please reassign these tasks before deleting this employee.`,
                        type: 'HAS_ASSOCIATED_TASKS'
                    });
                }

        // Use transaction to ensure all related records are deleted atomically
        await prisma.$transaction(async (tx) => {
            // Delete all potential relationships first
            console.log("Deleting sessions...");
            await tx.session.deleteMany({
                where: { userId: parseInt(id) }
            });
            
            console.log("Deleting project assignments...");
            await tx.projectUser.deleteMany({
                where: { userId: parseInt(id) }
            });
            
            // console.log("Updating tasks...");
            // await tx.task.updateMany({
            //     where: { userId: parseInt(id) },
            //     data: { userId: null }
            // });
            
            console.log("Deleting user...");
            await tx.user.delete({
                where: { id: parseInt(id) }
            });
        });

        return res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        return res.status(500).json({ 
            message: 'Internal server error', 
            details: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
    }
}