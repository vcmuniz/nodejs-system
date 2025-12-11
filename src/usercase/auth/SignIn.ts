import { User } from "../../domain/models/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { ITokenProvider } from "../../domain/providers/ITokenProvider";
import { IUseCase } from "../order/IUseCase";

export interface SignInInput {
    email: string;
    password: string;
}

export interface SignInOutput {
    user: User;
    token: string;
}

export class SignIn implements IUseCase<SignInInput, SignInOutput> {

    constructor(
        private userRepository: IUserRepository,
        private tokenProvider: ITokenProvider
    ) { }

    async execute(input: SignInInput): Promise<SignInOutput> {
        console.log('Executing SignIn with input:', input);
        const user = await this.userRepository.findByEmail(input.email);
        console.log('Found user:', user);
        if (!user) {
            throw new Error('User not found');
        }

        // if (user.password !== input.password) {
        //     throw new Error('Invalid password');
        // }k,jhb 

        const token = await this.tokenProvider.generateToken({ userId: user.id, email: user.email });

        return {
            user: user,
            token: token
        };
    }


}
