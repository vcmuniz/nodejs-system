import { bodyParser, urlEncode } from "./bodyParser"

import { cors } from "./cors"
import corsMid from "cors"
import { contentType } from "./contentType"
import { Express } from "express"

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
}
