import { describe, it, expect, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { SignInController } from './SignInController';
import { SignIn } from '../../../usercase/auth/SignIn';
import { MemoryUserRepository } from '../../../infra/database/factories/repositories/memory/MemoryUserRepository';

describe('SignInController - Unit Tests', () => {
    let controller: SignInController;
    let userRepository: MemoryUserRepository;

    beforeEach(() => {
        userRepository = new MemoryUserRepository();
        const signIn = new SignIn(userRepository);
        controller = new SignInController(signIn);
    });

    it('should sign in user with valid credentials', async () => {
        const req = {
            body: {
                email: 'test@example.com',
                password: 'password123'
            }
        } as Request;

        const jsonResponse: any = {};
        const res = {
            status: (code: number) => {
                res.statusCode = code;
                return res;
            },
            json: (data: any) => {
                Object.assign(jsonResponse, data);
            },
            statusCode: 0
        } as unknown as Response;

        await controller.handle(req, res);

        expect(res.statusCode).toBe(200);
        expect(jsonResponse.message).toBe('Sign in successful');
        expect(jsonResponse.user.email).toBe('test@example.com');
        expect(jsonResponse.token).toBeDefined();
    });

    it('should return 401 when user not found', async () => {
        const req = {
            body: {
                email: 'notfound@example.com',
                password: 'password123'
            }
        } as Request;

        const jsonResponse: any = {};
        const res = {
            status: (code: number) => {
                res.statusCode = code;
                return res;
            },
            json: (data: any) => {
                Object.assign(jsonResponse, data);
            },
            statusCode: 0
        } as unknown as Response;

        await controller.handle(req, res);

        expect(res.statusCode).toBe(401);
        expect(jsonResponse.error).toBe('User not found');
    });

    it('should return 401 when password is invalid', async () => {
        const req = {
            body: {
                email: 'test@example.com',
                password: 'wrongpassword'
            }
        } as Request;

        const jsonResponse: any = {};
        const res = {
            status: (code: number) => {
                res.statusCode = code;
                return res;
            },
            json: (data: any) => {
                Object.assign(jsonResponse, data);
            },
            statusCode: 0
        } as unknown as Response;

        await controller.handle(req, res);

        expect(res.statusCode).toBe(401);
        expect(jsonResponse.error).toBe('Invalid password');
    });

    it('should return 400 when email is missing', async () => {
        const req = {
            body: {
                password: 'password123'
            }
        } as Request;

        const jsonResponse: any = {};
        const res = {
            status: (code: number) => {
                res.statusCode = code;
                return res;
            },
            json: (data: any) => {
                Object.assign(jsonResponse, data);
            },
            statusCode: 0
        } as unknown as Response;

        await controller.handle(req, res);

        expect(res.statusCode).toBe(400);
        expect(jsonResponse.error).toContain('Missing required fields');
    });
});
