import { Request, Response } from "express";
import { IController } from "../IController";
import { SignIn } from "../../../usercase/auth/SignIn";

export class SignInController implements IController {
    constructor(private signIn: SignIn) { }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ error: 'Missing required fields: email, password' });
                return;
            }

            const result = await this.signIn.execute({ email, password });

            res.status(200).json({
                message: 'Sign in successful',
                user: result.user.getPublicData(),
                token: result.token
            });
        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    }
}
