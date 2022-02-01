import UserRepository from "../database/repositories/user.repository";
import {getCustomRepository} from "typeorm";
import * as bCrypt from "bcryptjs";
import {IService} from "../bin/common/interfaces/service.interface";
import {UserDataModel} from "../models/responses/user-data.model";
import {UserEntity} from "../database/entities/user.entity";

export class UserService implements IService {
    private _userRepo: UserRepository;

    async use(...args: any): Promise<void> {
        this._userRepo = getCustomRepository(UserRepository, "chat");
    }

    public async findByID(user_id: string, withDeleted: boolean = false): Promise<UserDataModel | null> {
        const user = await this._userRepo._findOne(user_id, 'user_id', withDeleted);
        if (user) {
            return new UserDataModel(
                user.user_id,
                user.user_role,
                user.user_name,
                user.user_email,
                user.user_status,
                user.user_username,
                user.user_image,
                user.user_created_at,
                user.user_updated_at
            );
        }
        return null;
    }

    public async login(username: string, password: string): Promise<UserDataModel | null> {
        const user = await this._userRepo._findOne(username, 'user_username', false);
        if (user) {
            if (user.comparePassword(password)) {
                return new UserDataModel(
                    user.user_id,
                    user.user_role,
                    user.user_name,
                    user.user_email,
                    user.user_status,
                    user.user_username,
                    user.user_image,
                    user.user_created_at,
                    user.user_updated_at
                );
            }
        }
        return null;
    }

    public async insert(userData: UserEntity): Promise<UserDataModel | null> {
        try {
            userData.user_password = bCrypt.hashSync(userData.user_password, bCrypt.genSaltSync(10));
            const user_id = await this._userRepo._insert(userData);
            if (user_id) {
                userData.user_id = user_id;
                return new UserDataModel(
                    userData.user_id,
                    userData.user_role,
                    userData.user_name,
                    userData.user_email,
                    userData.user_status,
                    userData.user_username,
                    userData.user_image,
                    userData.user_created_at,
                    userData.user_updated_at
                );
            }
        } catch (e) {
            console.error('[%s] Error:', UserService.name, e.message);
        }
        return null;
    }

    public async allUsers(options?: any): Promise<UserDataModel[]> {
        const rows = await this._userRepo._find(options);
        const users = [];
        for (const row of rows) {
            users.push(new UserDataModel(
                row.user_id,
                row.user_role,
                row.user_name,
                row.user_email,
                row.user_status,
                row.user_username,
                row.user_image,
                row.user_created_at,
                row.user_updated_at
            ));
        }
        return users;
    }

    public async delete(user_id: string): Promise<boolean> {
        return await this._userRepo._delete(user_id);
    }
}
