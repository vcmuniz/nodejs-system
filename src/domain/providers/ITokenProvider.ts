import { IDecodedToken } from "../auth/IDecodedToken";

export interface ITokenProvider {
    generateToken(data: IDecodedToken): Promise<string>;
    decodeToken(token: string): Promise<IDecodedToken | null>;
}

export default ITokenProvider;
