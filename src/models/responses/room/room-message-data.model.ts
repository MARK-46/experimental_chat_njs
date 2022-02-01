import { RoomFileDataModel } from "./room-file-data.model";
import { UserDataModel } from "../user-data.model";
import { RoomMessageTypesEnum } from "../../../bin/common/enum/room-message-types.enum";

export class RoomMessageDataModel {
    constructor(
        public message_id: string,
        public message_room_id: string,
        public message_content: string,
        public message_type: number,
        public message_created_at: Date,
        public message_updated_at: Date,
        public message_author: UserDataModel,
        public message_files: RoomFileDataModel[],
        public message_reply: RoomMessageDataModel,
        public message_recipients: UserDataModel[],
        public message_type_label?: string,

    ) {
        this.message_type_label = RoomMessageTypesEnum[message_type];
        if (this.message_type != RoomMessageTypesEnum.TEXT) {
            delete this.message_content;
        }
    }
}
