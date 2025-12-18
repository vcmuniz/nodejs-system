import { Express, Router } from "express"
import { PrismaClient } from "@prisma/client";
import { makeAuthRoutes } from "./auth.routes";
import { makeOrderRoutes } from "./order.routes";
import { makeWhatsAppRoutes } from "./whatsapp.routes";
import { makeMessagingRoutes } from "./messaging.routes";
import { makeUserRepository } from "../../infra/database/factories/makeUserRepository";
import { makeOrderRepository } from "../../infra/database/factories/makeOrderRepository";
import JsonWebTokenProvider from "../../infra/auth/JsonWebTokenProvider";
import { makeIndexRouter } from "./index.routes";
import { makeProductRoutes } from "./product.routes";
import { makeCategoryRoutes } from "./category.routes";
import { makeStockRoutes } from "./stock.routes";
import { makeQuoteRoutes } from "./quote.routes";
import integrationCredentialsRoutes from "./integration-credentials.routes";
import { makeContactRoutes } from "./contacts.routes";
import { makeLeadCaptureRoutes, makePublicLeadRoutes } from "./lead-captures.routes";
import { makeBusinessProfileRoutes } from "./business-profile.routes";
import { makeProductRoutes as makeNewProductRoutes } from "./products.routes";
import { makeUploadRoutes } from "./upload.routes";

const prisma = new PrismaClient();

export default (app: Express): void => {
    app.use("/", makeIndexRouter());
    app.use("/api/auth", makeAuthRoutes(makeUserRepository(), new JsonWebTokenProvider()));
    app.use("/api/orders", makeOrderRoutes(makeOrderRepository()));
    app.use("/api/whatsapp", makeWhatsAppRoutes()); // OLD - Deprecated
    app.use("/api/messaging", makeMessagingRoutes()); // NEW - Multi-channel
    
    app.use("/api/inventory/products", makeProductRoutes());
    app.use("/api/inventory/categories", makeCategoryRoutes());
    app.use("/api/inventory/stock", makeStockRoutes());
    app.use("/api/inventory/quotes", makeQuoteRoutes());
    
    app.use("/api/integration-credentials", integrationCredentialsRoutes);
    
    app.use("/api/contacts", makeContactRoutes(prisma));
    app.use("/api/lead-captures", makeLeadCaptureRoutes(prisma));
    app.use("/public/lead", makePublicLeadRoutes(prisma));
    
    app.use("/api/business-profiles", makeBusinessProfileRoutes(prisma));
    
    // New Products API (Clean Architecture)
    app.use("/api/products", makeNewProductRoutes(prisma));
    
    // Upload API
    app.use("/api/upload", makeUploadRoutes());
}