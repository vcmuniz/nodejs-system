import { User } from "../../../../domain/models/User";
import { IUserRepository } from "../../../../domain/repositories/IUserRepository";

export class UserRepositoryImpl implements IUserRepository {
    constructor(private impl: IUserRepository) { }
    findById(id: string): Promise<User | null> {
       return this.impl.findById(id);
    }
    findByEmail(email: string): Promise<User | null> {
        return this.impl.findByEmail(email);
    }
    save(user: User): Promise<User> {
        return this.impl.save(user);
    }

}