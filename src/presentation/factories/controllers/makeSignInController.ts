import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { ITokenProvider } from "../../../domain/providers/ITokenProvider";
import { SignIn } from "../../../usercase/auth/SignIn";
import { SignInController } from "../../controllers/auth/SignInController";

export function makeSignInController(userRepository: IUserRepository, tokenProvider: ITokenProvider): SignInController {
    const signIn = new SignIn(userRepository, tokenProvider);
    return new SignInController(signIn);
}
