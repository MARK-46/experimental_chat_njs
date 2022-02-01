import { socketServer } from "../../index";
import { UserBanEntity } from "../../database/entities/user-ban.entity";
import { UserRolesEnum } from "../../bin/common/enum/user-roles.enum";

export class UserDataModel {
    constructor(
        public user_id: string,
        public user_role: number,
        public user_name: string,
        public user_email: string,
        public user_status: number,
        public user_username: string,
        public user_image: string,
        public user_created_at: Date,
        public user_updated_at: Date,
        public user_recipient_type?: number,
        public user_role_label?: string,
        public user_bans?: UserBanEntity[],
        public user_banned_clients?: UserBanEntity[],
        public user_online?: boolean,
    ) {
        this.user_image = UserDataModel.getUserImage(user_image);
        this.user_role_label = UserDataModel.getUserRoleLabel(user_role);
        this.user_online = socketServer.clients().has(user_id);
    }

    public static getUserRoleLabel(role: number): string {
        if (role == UserRolesEnum.GUEST) return 'Guest';
        else if (role == UserRolesEnum.GOD) return 'God';
        else if (role == UserRolesEnum.ADMIN) return 'Admin';
        else if (role == UserRolesEnum.MODER) return 'Moder';
        else if (role == UserRolesEnum.USER) return 'User';
        return 'Undefined';
    }

    public static getUserImage(image: string, role: number = UserRolesEnum.GUEST): string {
        if (image) {
            if (image.startsWith('/')) {
                return 'http://185.177.105.151:1998' + image;
            }
            return image;
        }

        if (role == UserRolesEnum.ADMIN) {
            return 'http://185.177.105.151:1998/static/admin.png'
        }

        return 'http://185.177.105.151:1998/static/guest.png'
    }
}
