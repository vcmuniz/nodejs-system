import { ENV } from "./config/enviroments";

; (async () => {
    const server = await (await import("./app")).default

    const PORT = ENV.PORT || 8080;

    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });

})();