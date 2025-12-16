import { User } from '../../../../../domain/models/User';
import { IUserRepository } from '../../../../../domain/repositories/IUserRepository';
import prisma from '../../../prisma';

export class PrismaUserRepository implements IUserRepository {
    async findByEmail(email: string): Promise<User | null> {
        const user = await prisma.users.findUnique({
            where: { email }
        });

        console.log('Prisma found user:', user);

        if (!user) return null;

        return new User(user.id, user.email, user.password || '', user.name, user.role);
    }

    async save(user: User): Promise<User> {
        const saved = await prisma.users.upsert({
            where: { email: user.email },
            update: {
                name: user.name,
                password: user.password,
                updatedAt: new Date()
            },
            create: {
                id: user.id,
                email: user.email,
                password: user.password,
                name: user.name,
                role: (user.role as any) || 'USER',
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        return new User(saved.id, saved.email, saved.password || '', saved.name, saved.role);
    }

    async findById(id: string): Promise<User | null> {
        const user = await prisma.users.findUnique({
            where: { id }
        });

        if (!user) return null;

        return new User(user.id, user.email, user.password || '', user.name, user.role);
    }
}
