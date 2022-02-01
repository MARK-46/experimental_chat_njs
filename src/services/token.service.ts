import AccessTokenRepository from "../database/repositories/access-token.repository";
import RefreshTokenRepository from "../database/repositories/refresh-token.repository";
import {getCustomRepository} from "typeorm";
import {IService} from "../bin/common/interfaces/service.interface";
import {AuthResponseModel, TokenDataModel} from "../models/responses/auth-data.model";
import {UserDataModel} from "../models/responses/user-data.model";
import {AuthAccessTokenEntity} from "../database/entities/auth-access-token.entity";

export class TokenService implements IService {
    public static ACCESS_TOKEN_DAYS: number = 3;
    public static REFRESH_TOKEN_DAYS: number = 30;

    private _accessTokenRepo: AccessTokenRepository;
    private _refreshTokenRepo: RefreshTokenRepository;

    async use(...args: any): Promise<void> {
        this._accessTokenRepo = getCustomRepository(AccessTokenRepository, "chat");
        this._refreshTokenRepo = getCustomRepository(RefreshTokenRepository, "chat");
    }

    public async create(user: UserDataModel): Promise<AuthResponseModel | null> {
        try {
            const refresh_token = await this._refreshTokenRepo._insert(user.user_id, TokenService.REFRESH_TOKEN_DAYS);
            if (refresh_token) {
                const access_token = await this._accessTokenRepo._insert(user.user_id, refresh_token.refresh_id, TokenService.ACCESS_TOKEN_DAYS);
                if (access_token) {
                    return {
                        access_token: new TokenDataModel(access_token.token, access_token.expires_at, access_token.created_at),
                        refresh_token: new TokenDataModel(refresh_token.refresh_token, refresh_token.expires_at, refresh_token.created_at),
                        user: new UserDataModel(
                            user.user_id,
                            user.user_role,
                            user.user_name,
                            user.user_email,
                            user.user_status,
                            user.user_username,
                            user.user_image,
                            user.user_created_at,
                            user.user_updated_at
                        )
                    };
                }
            }
        } catch (e) {
            console.error('[%s] Error:', TokenService.name, e.message);
        }
        return null;
    }

    public async checkAccessToken(user_id: string, token: string): Promise<boolean> {
        const result = await this._accessTokenRepo.findOne({where: {user_id: user_id, token: token, revoked: 0}});
        return !!result;
    }

    public async getAccessToken(token: string): Promise<AuthAccessTokenEntity | null> {
        return await this._accessTokenRepo.findOne({where: {token: token, revoked: 0}});
    }

    public async deleteAccessToken(token: string): Promise<boolean> {
        const access_token = await this.getAccessToken(token);
        if (access_token) {
            await this._accessTokenRepo.delete({refresh_token_id: access_token.refresh_token_id});
            await this._refreshTokenRepo.delete({refresh_id: access_token.refresh_token_id});
            return true;
        }
        return false;
    }

    public async refreshToken(user_id: string, refresh_token_id: string, refresh_token: string): Promise<TokenDataModel | null> {
        const result = await this._refreshTokenRepo.findOne({where: {user_id: user_id, refresh_token: refresh_token, revoked: 0}});
        if (result && refresh_token_id == result.refresh_id) {
            const new_token = await this._accessTokenRepo._insert(user_id, result.refresh_id, TokenService.ACCESS_TOKEN_DAYS);
            if (new_token) {
                return new TokenDataModel(new_token.token, new_token.expires_at, new_token.created_at);
            }
        }
        return null;
    }
}
