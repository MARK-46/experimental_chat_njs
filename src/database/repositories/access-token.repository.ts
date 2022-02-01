import {EntityRepository, Repository} from 'typeorm'
import moment from "moment";
import crypto from "crypto";
import {AuthAccessTokenEntity} from "../entities/auth-access-token.entity";

@EntityRepository(AuthAccessTokenEntity)
export default class AccessTokenRepository extends Repository<AuthAccessTokenEntity> {
    async _insert(user_id: string, refresh_token_id: string, days: number): Promise<AuthAccessTokenEntity | null> {
        const created_at = moment();
        const expires_at = moment().add(days, 'days');
        const token = crypto.createHash('sha512')
            .update(`ID:${user_id}-S:${created_at}-E:${expires_at}`).digest('hex').toUpperCase();
        const result = await this.insert({
            user_id: user_id,
            refresh_token_id: refresh_token_id,
            token: token,
            revoked: 0,
            expires_at: expires_at.toDate(),
            created_at: created_at.toDate(),
        });

        if (result && result.identifiers && result.identifiers.length > 0) {
            return {
                token_id: result.identifiers[0]['token_id'],
                refresh_token_id: refresh_token_id,
                token: token,
                revoked: 0,
                created_at: created_at.toDate(),
                expires_at: expires_at.toDate(),
                user_id: user_id,
            };
        }

        return null;
    }
}
