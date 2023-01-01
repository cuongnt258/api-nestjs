import { ResetPasswordDto } from './dto/reset-password.dto';
import { Request } from 'express';
import { AuthService } from './../auth/auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { Model } from 'mongoose';
import { CreateForgotPasswordDto } from './dto/create-forgot-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyUuidDto } from './dto/verify-uuid.dto';
import { RefreshAccessTokenDto } from './dto/refresh-access-token.dto';
import { ForgotPassword } from './interfaces/forgot-password.interface';
import { User } from './interfaces/user.interface';
export declare class UserService {
    private readonly userModel;
    private readonly forgotPasswordModel;
    private readonly authService;
    HOURS_TO_VERIFY: number;
    HOURS_TO_BLOCK: number;
    LOGIN_ATTEMPTS_TO_BLOCK: number;
    constructor(userModel: Model<User>, forgotPasswordModel: Model<ForgotPassword>, authService: AuthService);
    create(createUserDto: CreateUserDto): Promise<User>;
    verifyEmail(req: Request, verifyUuidDto: VerifyUuidDto): Promise<{
        fullName: string;
        email: string;
        accessToken: string;
        refreshToken: string;
    }>;
    login(req: Request, loginUserDto: LoginUserDto): Promise<{
        fullName: string;
        email: string;
        accessToken: string;
        refreshToken: string;
    }>;
    refreshAccessToken(refreshAccessTokenDto: RefreshAccessTokenDto): Promise<{
        accessToken: string;
    }>;
    forgotPassword(req: Request, createForgotPasswordDto: CreateForgotPasswordDto): Promise<{
        email: string;
        message: string;
    }>;
    forgotPasswordVerify(req: Request, verifyUuidDto: VerifyUuidDto): Promise<{
        email: string;
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        email: string;
        message: string;
    }>;
    findAll(): any;
    private isEmailUnique;
    private setRegistrationInfo;
    private buildRegistrationInfo;
    private findByVerification;
    private findByEmail;
    private setUserAsVerified;
    private findUserByEmail;
    private checkPassword;
    private isUserBlocked;
    private passwordsDoNotMatch;
    private blockUser;
    private passwordsAreMatch;
    private saveForgotPassword;
    private findForgotPasswordByUuid;
    private setForgotPasswordFirstUsed;
    private findForgotPasswordByEmail;
    private setForgotPasswordFinalUsed;
    private resetUserPassword;
}
