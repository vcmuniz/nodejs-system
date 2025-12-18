import { bodyParser, urlEncode } from "./bodyParser"

import { cors } from "./cors"
import corsMid from "cors"
import { contentType } from "./contentType"
import { Express } from "express"
import express from "express"
import path from "path"

export function initMiddleware(app: Express): void {
    // CORS para todas as rotas
    const corsConfig = {
        origin: true,
        credentials: true
    }
    app.use(corsMid(corsConfig))
    
    // Middlewares para rotas da API
    app.use(urlEncode)
    app.use(bodyParser)
    
    // Aplicar contentType apenas em rotas da API
    app.use('/api', contentType)
}
