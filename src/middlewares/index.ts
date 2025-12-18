import { bodyParser, urlEncode } from "./bodyParser"

import { cors } from "./cors"
import corsMid from "cors"
import { contentType } from "./contentType"
import { Express } from "express"
import express from "express"
import path from "path"

export function initMiddleware(app: Express): void {
    app.use(urlEncode)
    app.use(bodyParser)
    app.use(cors)

    const corsConfig = {
        origin: true,
        credentials: true
    }
    app.use(corsMid(corsConfig))
    app.use(contentType)
    
    // Servir arquivos estáticos da pasta uploads
    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))
}
