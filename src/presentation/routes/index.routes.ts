import { Router } from "express"

export function makeIndexRouter() {
    const router = Router();

    router.get("/health", (req, res) => {
        res.status(200).send("OK");
    });

    router.get("/", (req, res) => {
        res.status(200).send("Welcome to the API");
    });

    return router;
}