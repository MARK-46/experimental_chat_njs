import {getCustomRepository} from "typeorm";
import {RoomFileRepository} from "../../database/repositories/room/room-file.repository";
import {IService} from "../../bin/common/interfaces/service.interface";
import {RoomFileDataModel} from "../../models/responses/room/room-file-data.model";

export class RoomFileService implements IService {
    private roomFileRepo: RoomFileRepository;

    async use(...args: any): Promise<void> {
        this.roomFileRepo = getCustomRepository(RoomFileRepository, "chat");
    }

    async create(file_room_id: string, file_message_id: string, file_name: string, file_path: string, file_mime_type: string): Promise<boolean> {
        const result = await this.roomFileRepo.insert({file_room_id, file_message_id, file_name, file_path, file_mime_type});
        return result.identifiers.length > 0;
    }

    public async delete({file_id, file_room_id, file_message_id}: { file_id?: string, file_room_id?: string, file_message_id?: string }): Promise<boolean> {
        return await this.roomFileRepo._delete({file_id, file_room_id, file_message_id});
    }

    async findAll(file_room_id: string, file_message_id: string): Promise<RoomFileDataModel[]> {
        const rows = await this.roomFileRepo.find({where: {file_room_id, file_message_id}});
        const files = [];
        for (const row of rows) {
            files.push(new RoomFileDataModel(
                row.file_id,
                row.file_room_id,
                row.file_message_id,
                row.file_name,
                row.file_path,
                row.file_mime_type,
                row.file_created_at,
            ));
        }
        return files;
    }
}
