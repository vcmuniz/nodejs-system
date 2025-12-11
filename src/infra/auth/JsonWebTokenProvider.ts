import jwt from 'jsonwebtoken';
import { ENV } from '../../config/enviroments';
import { ITokenProvider } from '../../domain/providers/ITokenProvider';
import { IDecodedToken } from '../../domain/auth/IDecodedToken';

export class JsonWebTokenProvider implements ITokenProvider {
    async generateToken(data: IDecodedToken): Promise<string> {
        const token = jwt.sign(data, ENV.JWT_SECRET, { expiresIn: '24h' });
        return token;
    }

    async decodeToken(token: string): Promise<IDecodedToken | null> {
        try {
            const decoded = jwt.verify(token, ENV.JWT_SECRET) as IDecodedToken;
            return decoded;
        } catch (error) {
            return null;
        }
    }
}

export default JsonWebTokenProvider;
