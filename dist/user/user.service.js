"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("./../auth/auth.service");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const uuid_1 = require("uuid");
const date_fns_1 = require("date-fns");
const bcrypt = require("bcrypt");
let UserService = class UserService {
    constructor(userModel, forgotPasswordModel, authService) {
        this.userModel = userModel;
        this.forgotPasswordModel = forgotPasswordModel;
        this.authService = authService;
        this.HOURS_TO_VERIFY = 4;
        this.HOURS_TO_BLOCK = 6;
        this.LOGIN_ATTEMPTS_TO_BLOCK = 5;
    }
    create(createUserDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = new this.userModel(createUserDto);
            yield this.isEmailUnique(user.email);
            this.setRegistrationInfo(user);
            yield user.save();
            return this.buildRegistrationInfo(user);
        });
    }
    verifyEmail(req, verifyUuidDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.findByVerification(verifyUuidDto.verification);
            yield this.setUserAsVerified(user);
            return {
                fullName: user.fullName,
                email: user.email,
                accessToken: yield this.authService.createAccessToken(user._id),
                refreshToken: yield this.authService.createRefreshToken(req, user._id),
            };
        });
    }
    login(req, loginUserDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.findUserByEmail(loginUserDto.email);
            this.isUserBlocked(user);
            yield this.checkPassword(loginUserDto.password, user);
            yield this.passwordsAreMatch(user);
            return {
                fullName: user.fullName,
                email: user.email,
                accessToken: yield this.authService.createAccessToken(user._id),
                refreshToken: yield this.authService.createRefreshToken(req, user._id),
            };
        });
    }
    refreshAccessToken(refreshAccessTokenDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = yield this.authService.findRefreshToken(refreshAccessTokenDto.refreshToken);
            const user = yield this.userModel.findById(userId);
            if (!user) {
                throw new common_1.BadRequestException('Bad request');
            }
            return {
                accessToken: yield this.authService.createAccessToken(user._id),
            };
        });
    }
    forgotPassword(req, createForgotPasswordDto) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.findByEmail(createForgotPasswordDto.email);
            yield this.saveForgotPassword(req, createForgotPasswordDto);
            return {
                email: createForgotPasswordDto.email,
                message: 'verification sent.',
            };
        });
    }
    forgotPasswordVerify(req, verifyUuidDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const forgotPassword = yield this.findForgotPasswordByUuid(verifyUuidDto);
            yield this.setForgotPasswordFirstUsed(req, forgotPassword);
            return {
                email: forgotPassword.email,
                message: 'now reset your password.',
            };
        });
    }
    resetPassword(resetPasswordDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const forgotPassword = yield this.findForgotPasswordByEmail(resetPasswordDto);
            yield this.setForgotPasswordFinalUsed(forgotPassword);
            yield this.resetUserPassword(resetPasswordDto);
            return {
                email: resetPasswordDto.email,
                message: 'password successfully changed.',
            };
        });
    }
    findAll() {
        return { hello: 'world' };
    }
    isEmailUnique(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userModel.findOne({ email, verified: true });
            if (user) {
                throw new common_1.BadRequestException('Email most be unique.');
            }
        });
    }
    setRegistrationInfo(user) {
        user.verification = uuid_1.v4();
        user.verificationExpires = date_fns_1.addHours(new Date(), this.HOURS_TO_VERIFY);
    }
    buildRegistrationInfo(user) {
        const userRegistrationInfo = {
            fullName: user.fullName,
            email: user.email,
            verified: user.verified,
        };
        return userRegistrationInfo;
    }
    findByVerification(verification) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userModel.findOne({
                verification,
                verified: false,
                verificationExpires: { $gt: new Date() },
            });
            if (!user) {
                throw new common_1.BadRequestException('Bad request.');
            }
            return user;
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userModel.findOne({ email, verified: true });
            if (!user) {
                throw new common_1.NotFoundException('Email not found.');
            }
            return user;
        });
    }
    setUserAsVerified(user) {
        return __awaiter(this, void 0, void 0, function* () {
            user.verified = true;
            yield user.save();
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userModel.findOne({ email, verified: true });
            if (!user) {
                throw new common_1.NotFoundException('Wrong email or password.');
            }
            return user;
        });
    }
    checkPassword(attemptPass, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const match = yield bcrypt.compare(attemptPass, user.password);
            if (!match) {
                yield this.passwordsDoNotMatch(user);
                throw new common_1.NotFoundException('Wrong email or password.');
            }
            return match;
        });
    }
    isUserBlocked(user) {
        if (user.blockExpires > Date.now()) {
            throw new common_1.ConflictException('User has been blocked try later.');
        }
    }
    passwordsDoNotMatch(user) {
        return __awaiter(this, void 0, void 0, function* () {
            user.loginAttempts += 1;
            yield user.save();
            if (user.loginAttempts >= this.LOGIN_ATTEMPTS_TO_BLOCK) {
                yield this.blockUser(user);
                throw new common_1.ConflictException('User blocked.');
            }
        });
    }
    blockUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            user.blockExpires = date_fns_1.addHours(new Date(), this.HOURS_TO_BLOCK);
            yield user.save();
        });
    }
    passwordsAreMatch(user) {
        return __awaiter(this, void 0, void 0, function* () {
            user.loginAttempts = 0;
            yield user.save();
        });
    }
    saveForgotPassword(req, createForgotPasswordDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const forgotPassword = yield this.forgotPasswordModel.create({
                email: createForgotPasswordDto.email,
                verification: uuid_1.v4(),
                expires: date_fns_1.addHours(new Date(), this.HOURS_TO_VERIFY),
                ip: this.authService.getIp(req),
                browser: this.authService.getBrowserInfo(req),
                country: this.authService.getCountry(req),
            });
            yield forgotPassword.save();
        });
    }
    findForgotPasswordByUuid(verifyUuidDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const forgotPassword = yield this.forgotPasswordModel.findOne({
                verification: verifyUuidDto.verification,
                firstUsed: false,
                finalUsed: false,
                expires: { $gt: new Date() },
            });
            if (!forgotPassword) {
                throw new common_1.BadRequestException('Bad request.');
            }
            return forgotPassword;
        });
    }
    setForgotPasswordFirstUsed(req, forgotPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            forgotPassword.firstUsed = true;
            forgotPassword.ipChanged = this.authService.getIp(req);
            forgotPassword.browserChanged = this.authService.getBrowserInfo(req);
            forgotPassword.countryChanged = this.authService.getCountry(req);
            yield forgotPassword.save();
        });
    }
    findForgotPasswordByEmail(resetPasswordDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const forgotPassword = yield this.forgotPasswordModel.findOne({
                email: resetPasswordDto.email,
                firstUsed: true,
                finalUsed: false,
                expires: { $gt: new Date() },
            });
            if (!forgotPassword) {
                throw new common_1.BadRequestException('Bad request.');
            }
            return forgotPassword;
        });
    }
    setForgotPasswordFinalUsed(forgotPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            forgotPassword.finalUsed = true;
            yield forgotPassword.save();
        });
    }
    resetUserPassword(resetPasswordDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userModel.findOne({
                email: resetPasswordDto.email,
                verified: true,
            });
            user.password = resetPasswordDto.password;
            yield user.save();
        });
    }
};
UserService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('User')),
    __param(1, mongoose_1.InjectModel('ForgotPassword')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        auth_service_1.AuthService])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map