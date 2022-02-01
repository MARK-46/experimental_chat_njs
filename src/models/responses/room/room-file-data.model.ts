export class RoomFileDataModel {
    constructor(
        public file_id: string,
        public file_room_id: string,
        public file_message_id: string,
        public file_name: string,
        public file_path: string,
        public file_mime_type: string,
        public file_created_at: Date,
    ) {
        this.file_path = RoomFileDataModel.handleFilePath(file_path);
    }

    private static handleFilePath(room_image: string): string {
        const host = 'http://185.177.105.151:1998';
        return room_image.startsWith('/') ? host + room_image : room_image;
    }
}