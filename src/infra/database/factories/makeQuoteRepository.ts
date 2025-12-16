import { QuoteRepositoryImpl } from "./repositories/QuoteRepositoryImpl";
import { PrismaQuoteRepository } from "./repositories/prisma/PrismaQuoteRepository";

export function makeQuoteRepository() {
    return new QuoteRepositoryImpl(new PrismaQuoteRepository());
}
