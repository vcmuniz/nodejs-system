import { IDecodedToken } from "./IDecodedToken";

export interface IAuthenticationValidator {
    validate(token: string): IDecodedToken | null;
}
