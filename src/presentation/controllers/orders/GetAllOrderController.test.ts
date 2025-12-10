import { beforeEach, describe, expect, it } from "vitest";
import { GetAllOrderController } from "./GetAllOrderController";

describe("GetAllOrderController - Unit Tests", () => {
    let controller: GetAllOrderController;

    beforeEach(() => {
        controller = new GetAllOrderController();
    });

    describe("handle", () => {
        it('should return all orders with status 200', async () => {
            const mockReq = {};
            let statusCode = 200;
            let jsonResponse: any = null;

            const mockRes = {
                status: (code: number) => {
                    statusCode = code;
                    return mockRes;
                },
                json: (data: any) => {
                    jsonResponse = data;
                }
            };

            await controller.handle(mockReq as any, mockRes as any);
            console.log("jsonResponse", jsonResponse);
            // Since the method is not implemented, we expect an error to be thrown
            expect(statusCode).toBe(200);
            expect(Array.isArray(jsonResponse)).toBe(true);
        })
    });
});