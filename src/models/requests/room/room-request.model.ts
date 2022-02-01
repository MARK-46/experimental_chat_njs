import { v1 as uuid } from "uuid";
import { IMulterFile } from "../../../bin/common/interfaces/multer-file.interface";

export class RoomRequestModel {
    constructor(
        public room_id: string = uuid(),
        public room_type: number,
        public room_name: string,
        public room_image: IMulterFile,
    ) { }
}

export class RoomMemberRequestModel {
    constructor(
        public members: { id: string, role: number }[]
    ) { }
}

export class RoomMessageRequestModel {
    constructor(
        public message_type: number,
        public message_content: string,
        public message_reply_id: string,
        public message_files: IMulterFile[],
        public message_deleted_files: string[],
    ) { }
}
