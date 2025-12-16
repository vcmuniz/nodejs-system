import { PrismaCategoryRepository } from "./prisma/PrismaCategoryRepository";

export class CategoryRepositoryImpl {
    constructor(private impl: PrismaCategoryRepository) {}

    create(data: any) {
        return this.impl.create(data);
    }

    findById(id: string) {
        return this.impl.findById(id);
    }

    findByName(name: string, userId: string) {
        return this.impl.findByName(name, userId);
    }

    findByUserId(userId: string) {
        return this.impl.findByUserId(userId);
    }

    update(id: string, data: any) {
        return this.impl.update(id, data);
    }

    delete(id: string) {
        return this.impl.delete(id);
    }
}
