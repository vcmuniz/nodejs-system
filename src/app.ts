import express from "express";
import initRoutes from "./presentation/routes/initRoutes";
import { initMiddleware } from "./middlewares";

const server = async () => {
    const app = express();
    initMiddleware(app);
    initRoutes(app);
    return app;
}

export default server()