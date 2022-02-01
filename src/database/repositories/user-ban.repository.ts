import {EntityRepository, Repository} from 'typeorm'
import {UserBanEntity} from "../entities/user-ban.entity";

@EntityRepository(UserBanEntity)
export default class UserBanRepository extends Repository<UserBanEntity> {
    async _ban(user_id: string, admin_id: string, type: number, reason: string, length: string): Promise<number> {
        const result = await this.insert({
            ban_user_id: user_id,
            ban_admin_id: admin_id,
            ban_type: type,
            ban_reason: reason,
            ban_length: length,
        });
        return result && result.generatedMaps.length > 0 ? result.generatedMaps[0].room_id : -1;
    }

    async _unBan(user_id: string): Promise<number> {
        const result = await this.update({ban_user_id: user_id}, {
            ban_status: 0
        });
        return result && result.generatedMaps.length > 0 ? result.generatedMaps[0].room_id : -1;
    }

    async _hasBan(user_id: string): Promise<number> {
        const bans = await this.createQueryBuilder('bans')
            .leftJoinAndSelect('bans.ban_admin', 'admin')
            .orderBy('ban_id', 'DESC')
            .select('ban_id')
            .where('ban_user_id = :user_id AND ban_status = 1', { user_id })
            .getMany();
        return bans.length > 0 ? 1 : -1;
    }
}
