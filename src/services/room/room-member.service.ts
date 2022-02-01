import { getCustomRepository } from "typeorm";
import { RoomMemberRepository } from "../../database/repositories/room/room-member.repository";
import { IService } from "../../bin/common/interfaces/service.interface";
import { RoomMemberEntity } from "../../database/entities/room/room-member.entity";
import { UserDataModel } from "../../models/responses/user-data.model";

export class RoomMemberService implements IService {
    private roomMemberRepo: RoomMemberRepository;

    async use(...args: any): Promise<void> {
        this.roomMemberRepo = getCustomRepository(RoomMemberRepository, "chat");
    }

    async exists(member_room_id: string, member_user_id: string): Promise<boolean> {
        const result = await this.roomMemberRepo.query(
            "SELECT EXISTS(SELECT member_role FROM ex__room_members WHERE member_room_id = ? AND member_user_id = ?) AS _status;",
            [member_room_id, member_user_id]);
        return result[0]['_status'] == 1;
    }

    async create(member_room_id: string, member_user_id: string, member_role: number): Promise<boolean> {
        const result = await this.roomMemberRepo.insert({ member_room_id, member_user_id, member_role });
        return result.identifiers.length > 0;
    }

    public async delete({member_room_id, member_user_id}:
                            { member_room_id?: string, member_user_id?: string }): Promise<boolean> {
        return await this.roomMemberRepo._delete({member_room_id, member_user_id});
    }

    async members(room_id: string): Promise<RoomMemberEntity[]> {
        return await this.roomMemberRepo.find({ where: { member_room_id: room_id } });
    }

    async memberList(room_id: string): Promise<UserDataModel[]> {
        const rows = await this.roomMemberRepo.find({ where: { member_room_id: room_id }, relations: ['member_user'] });
        const members = [];
        for (const row of rows) {
            if (row.member_user) {
                members.push(new UserDataModel(
                    row.member_user.user_id,
                    row.member_user.user_role,
                    row.member_user.user_name,
                    row.member_user.user_email,
                    row.member_user.user_status,
                    row.member_user.user_username,
                    row.member_user.user_image,
                    row.member_user.user_created_at,
                    row.member_user.user_updated_at
                ));
            }
        }
        return members;
    }
}
