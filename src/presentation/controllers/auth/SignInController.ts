import { Request, Response } from "express";
import { IController } from "../IController";
import { SignIn } from "../../../usercase/auth/SignIn";

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: Login de usuário
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Email ou senha inválidos
 *       401:
 *         description: Não autorizado
 */
export class SignInController implements IController {

    constructor(private signIn: SignIn) { }

    async handle(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Missing required fields: email, password' });
            return;
        }

        const result = await this.signIn.execute({ email, password })

        res.status(200).json({
            message: 'Login successful',
            token: result.token,
            user: result.user.getPublicData(),
        });
    }
}
