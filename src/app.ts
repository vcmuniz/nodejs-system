import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import initRoutes from "./presentation/routes/initRoutes";
import { initMiddleware } from "./middlewares";
import { PrismaClient } from "@prisma/client";
import { WhatsAppFactory } from "./infra/factories/whatsapp/WhatsAppFactory";
import { UploadFactory } from "./infra/factories/upload/UploadFactory";

const server = async () => {
    const app = express();
    
    // Inicializar WhatsApp Factory
    const prisma = new PrismaClient();
    WhatsAppFactory.initialize(prisma);
    UploadFactory.initialize(prisma);
    
    // Servir arquivos estáticos ANTES DE TUDO - não passar por outros middlewares
    const uploadsPath = require('path').join(process.cwd(), 'uploads');
    app.get('/uploads/*', (req, res, next) => {
        const filePath = req.path.replace('/uploads/', '');
        res.sendFile(filePath, { root: uploadsPath });
    });
    
    app.get("/api-docs/swagger.json", (req, res) => {
        res.json(swaggerSpec);
    });
    
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    
    initMiddleware(app);
    initRoutes(app);
    return app;
}

export default server()