import {EntityRepository, Repository} from 'typeorm'
import moment from "moment";
import crypto from "crypto";
import {AuthRefreshTokenEntity} from "../entities/auth-refresh-token.entity";

@EntityRepository(AuthRefreshTokenEntity)
export default class RefreshTokenRepository extends Repository<AuthRefreshTokenEntity> {
    async _insert(user_id: string, days: number): Promise<AuthRefreshTokenEntity | null> {
        const created_at = moment();
        const expires_at = moment().add(days, 'days');
        const token = crypto.createHash('sha512')
            .update(`ID:${user_id}-S:${created_at}-E:${expires_at}`).digest('hex').toUpperCase();
        const result = await this.insert({
            user_id: user_id,
            refresh_token: token,
            expires_at: expires_at.toDate(),
            created_at: created_at.toDate(),
        });

        if (result && result.identifiers && result.identifiers.length > 0) {
            return {
                refresh_id: result.identifiers[0]['refresh_id'],
                refresh_token: token,
                created_at: created_at.toDate(),
                expires_at: expires_at.toDate(),
                user_id: user_id,
            };
        }

        return null;
    }
}
