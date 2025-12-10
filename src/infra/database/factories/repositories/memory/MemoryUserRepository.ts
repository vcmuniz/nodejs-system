import { User } from "../../../../domain/models/User";
import { IUserRepository } from "../../../../domain/repositories/IUserRepository";

export class MemoryUserRepository implements IUserRepository {
    private users: User[] = [];

    async findById(id: string): Promise<User | null> {
        const user = this.users.find(user => user.id === id);
        return user || null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = this.users.find(user => user.email === email);
        return user || null;
    }

    async create(user: User): Promise<User> {
        this.users.push(user);
        return user;
    }

    async update(id: string, userData: Partial<{ email: string; name: string }>): Promise<User | null> {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1) return null;

        this.users[userIndex] = Object.assign(this.users[userIndex], userData);

        return this.users[userIndex];
    }

    async delete(id: string): Promise<boolean> {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1) return false;

        this.users.splice(userIndex, 1);
        return true;
    }

    async findAll(): Promise<User[]> {
        return this.users;
    }
}