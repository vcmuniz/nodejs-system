import { User } from '../../../../../domain/models/User';
import { IUserRepository } from '../../../../../domain/repositories/IUserRepository';
import prisma from '../../../prisma';

export class PrismaUserRepository implements IUserRepository {
    async findByEmail(email: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        console.log('Prisma found user:', user);

        if (!user) return null;

        return new User(user.id, user.email, user.password || '', user.name);
    }

    async save(user: User): Promise<User> {
        const saved = await prisma.user.upsert({
            where: { email: user.email },
            update: {
                name: user.name,
                password: user.password
            },
            create: {
                id: user.id,
                email: user.email,
                password: user.password,
                name: user.name,
                role: 'USER',
                status: 'ACTIVE'
            }
        });

        return new User(saved.id, saved.email, saved.password || '', saved.name);
    }

    async findById(id: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) return null;

        return new User(user.id, user.email, user.password || '', user.name);
    }
}
