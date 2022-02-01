import { RoomMessageDataModel } from "./room-message-data.model";
import { RoomTypesEnum } from "../../../bin/common/enum/room-types.enum";
import { socketServer } from "../../../index";
import { UserDataModel } from "../user-data.model";

export class RoomDataModel {
    constructor(
        public room_id: string,
        public room_type: number,
        public room_name: string,
        public room_image: string,
        public room_created_at: Date,
        public room_updated_at: Date,
        public room_type_label?: string,
        public room_last_message: RoomMessageDataModel = null,
        public room_members?: UserDataModel[],
        public room_online?: number,
        public room_nrm_count: number = 0,
    ) {
        this.room_type_label = RoomTypesEnum[room_type];
        this.room_image = RoomDataModel.handleImage(room_type, room_image);
        this.room_online = socketServer.clients(room_id).size;
    }

    private static handleImage(room_type: number, room_image: string): string {
        const host = 'http://185.177.105.151:1998';

        if (room_image) {
            return room_image.startsWith('/') ? host + room_image : room_image;
        }

        if (room_type == RoomTypesEnum.PRIVATE) {
            return host + "/static/room-image-1.png";
        }

        if (room_type == RoomTypesEnum.GROUP) {
            return host + "/static/room-image-2.png";
        }

        if (room_type == RoomTypesEnum.PRIVATE_GROUP) {
            return host + "/static/room-image-2.png";
        }
    }
}
