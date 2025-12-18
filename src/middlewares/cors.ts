import { Request, Response, NextFunction } from "express"

export const cors = (req: Request, res: Response, next: NextFunction): void => {
    // Não aplicar em rotas estáticas
    if (req.path.startsWith('/uploads')) {
        return next()
    }
    
    res.set("access-control-allow-origin", "*")
    res.set("access-control-allow-headers", "*")
    res.set("access-control-allow-methods", "*")
    res.set("access-control-allow-credentials", "*")

    next()
}
