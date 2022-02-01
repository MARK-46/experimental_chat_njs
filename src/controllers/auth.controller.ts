import {Body, HeaderParam, JsonController, Post, Req, Res} from "routing-controllers";
import {Response} from "express";
import {IRequest} from "../bin/common/interfaces/request.interface";
import {L, ValidatorUtility} from "../bin/utils";
import {LoginRequestModel, RefreshTokenRequestModel, RegisterRequestModel} from "../models/requests/auth-request.model";
import {StatusCodesEnum} from "../bin/common/enum/status-codes.enum";
import {getCustomService} from "../bin/utils/service-register.utility";
import {UserService} from "../services/user.service";
import {TokenService} from "../services/token.service";
import {UserRolesEnum} from "../bin/common/enum/user-roles.enum";
import {UserEntity} from "../database/entities/user.entity";
import {IResponse} from "../bin/common/interfaces/respons.interface";
import {response, responseError, responseValidationError} from "../bin/utils/response.utility";

@JsonController('/api')
export class AuthController {
    @Post('/login')
    async login(@Req() req: IRequest, @Res() res: Response,
                @Body({required: true}) data: LoginRequestModel): Promise<Response<IResponse>> {
        const validatorResult = await ValidatorUtility.check(data, {
            "username": "required|string|minLength:3|maxLength:36",
            "password": "required|string|minLength:6|maxLength:36",
        });

        if (validatorResult) {
            return responseValidationError(res, req, validatorResult);
        }

        const userService = getCustomService(UserService);
        const tokenService = getCustomService(TokenService);

        const user = await userService.login(data.username, data.password);
        if (user) {
            const token = await tokenService.create(user);
            if (token) {
                return response(res, false, token, {}, null, StatusCodesEnum.SUCCESS);
            }

            return responseError(res, null, {}, L('TOKEN_GENERATION_FAILED', req.language_code), StatusCodesEnum.BAD_REQUEST);
        }

        return responseError(res, null, {}, L('NOT_FOUND', req.language_code, 'Username or Password'), StatusCodesEnum.NOT_FOUND);
    }

    @Post('/register')
    async register(@Req() req: IRequest, @Res() res: Response,
                   @Body({required: true}) data: RegisterRequestModel): Promise<Response<IResponse>> {
        console.log('reg', data)

        const validatorResult = await ValidatorUtility.check(data, {
            "username": "required|regex:^[A-Za-z0-9_-]{3,15}$|unique:chat,ex__users,user_username",
            "password": "required|string|minLength:6|maxLength:36|same:confirm_password",
            "name": "required|string|minLength:3|maxLength:36",
            "email": "required|email|minLength:3|maxLength:36|unique:chat,ex__users,user_email",
            "avatar": "is_object|file_mimetype:image/gif,image/png,image/jpg,image/jpeg",
        });

        if (validatorResult) {
            return responseValidationError(res, req, validatorResult);
        }

        const userService = getCustomService(UserService);
        const tokenService = getCustomService(TokenService);

        const user = await userService.insert({
            user_name: data.name,
            user_role: UserRolesEnum.USER,
            user_email: data.email,
            user_username: data.username,
            user_password: data.password,
            user_image: data.avatar?.public_path,
            user_status: 1,
            user_language_id: 1,
        } as UserEntity);

        if (user) {
            const token = await tokenService.create(user);
            if (token) {
                return response(res, false, token, {}, null, StatusCodesEnum.SUCCESS);
            }
        }

        return responseError(res, null, {}, L('BAD_REQUEST', req.language_code), StatusCodesEnum.BAD_REQUEST);
    }

    @Post('/refresh-token')
    async refreshToken(@Req() req: IRequest, @Res() res: Response,
                       @HeaderParam('ex-authorization') authToken: string,
                       @Body({required: true}) data: RefreshTokenRequestModel): Promise<Response<IResponse>> {
        const validatorResult = await ValidatorUtility.check(data, {
            "refresh_token": "required|regex:^[A-F0-9]{128,128}$",
        });

        if (validatorResult) {
            return responseValidationError(res, req, validatorResult);
        }

        const tokenService = getCustomService(TokenService);
        const accessToken = await tokenService.getAccessToken(authToken);
        if (accessToken) {
            const new_access_token = await tokenService.refreshToken(accessToken.user_id, accessToken.refresh_token_id, data.refresh_token);
            if (new_access_token) {
                return response(res, false, new_access_token, {}, null, StatusCodesEnum.SUCCESS);
            }
        }

        return responseError(res, null, {}, L('BAD_REQUEST', req.language_code), StatusCodesEnum.UNAUTHENTICATED);
    }

    @Post("/logout")
    async logout(@Req() req: IRequest, @Res() res: Response,
                 @HeaderParam('ex-authorization') authToken: string): Promise<Response<IResponse>> {
        const tokenService = getCustomService(TokenService);
        if (await tokenService.deleteAccessToken(authToken)) {
            return response(res, false, null, {}, L('SUCCESS', req.language_code), StatusCodesEnum.SUCCESS);
        }

        return responseError(res, null, {}, L('BAD_REQUEST', req.language_code), StatusCodesEnum.UNAUTHENTICATED);
    }
}
