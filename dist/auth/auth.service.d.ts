import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User } from 'src/user/interfaces/user.interface';
import { RefreshToken } from './interfaces/refresh-token.interface';
import { Request } from 'express';
export declare class AuthService {
    private readonly userModel;
    private readonly refreshTokenModel;
    private readonly jwtService;
    cryptr: any;
    constructor(userModel: Model<User>, refreshTokenModel: Model<RefreshToken>, jwtService: JwtService);
    createAccessToken(userId: string): Promise<string>;
    createRefreshToken(req: Request, userId: any): Promise<string>;
    findRefreshToken(token: string): Promise<User>;
    validateUser(jwtPayload: JwtPayload): Promise<any>;
    private jwtExtractor;
    returnJwtExtractor(): (request: any) => any;
    getIp(req: Request): string;
    getBrowserInfo(req: Request): string;
    getCountry(req: Request): string;
    encryptText(text: string): string;
}
