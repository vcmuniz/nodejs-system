import { CategoryRepositoryImpl } from "./repositories/CategoryRepositoryImpl";
import { PrismaCategoryRepository } from "./repositories/prisma/PrismaCategoryRepository";

export function makeCategoryRepository() {
    return new CategoryRepositoryImpl(new PrismaCategoryRepository());
}
