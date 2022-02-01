import { EntityRepository, Repository } from "typeorm";
import { RoomMemberEntity } from "../../entities/room/room-member.entity";
import moment from "moment";

@EntityRepository(RoomMemberEntity)
export class RoomMemberRepository extends Repository<RoomMemberEntity> {
    async _delete({ member_room_id, member_user_id }:
            { member_room_id?: string, member_user_id?: string }): Promise<boolean> {
        if (member_room_id || member_user_id) {
            const query = {};
            if (member_room_id) query['member_room_id'] = member_room_id;
            if (member_user_id) query['member_user_id'] = member_user_id;

            const result = await this.update(query, { member_deleted_at: moment().toDate() });
            return result && result.affected == 1;
        }
        return false;
    }
}
