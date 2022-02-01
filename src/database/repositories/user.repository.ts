import {EntityRepository, Repository} from 'typeorm'
import {FindManyOptions} from "typeorm/find-options/FindManyOptions";
import {UserEntity} from "../entities/user.entity";
import moment from "moment";

@EntityRepository(UserEntity)
export default class UserRepository extends Repository<UserEntity> {
    async _findUsers(): Promise<UserEntity[]> {
        return await this.find();
    }

    async _find(opt: FindManyOptions<UserEntity>): Promise<UserEntity[]> {
        return await this.find(opt);
    }

    async _findOne(value: string, columnName: string = 'user_id', withDeleted: boolean = false): Promise<UserEntity | null> {
        const user = await this.findOne({ [columnName]: value }, {withDeleted: withDeleted});
        if (user) {
            return user;
        }
        return null;
    }

    async _insert(user: UserEntity): Promise<string | null> {
        const result = await this.insert(user);
        return result && result.identifiers && result.identifiers.length > 0 ? result.identifiers[0]['user_id'] : null;
    }

    async _delete(user_id: string): Promise<boolean> {
        if (!user_id) return false;
        const result = await this.update({ user_id: user_id }, {user_deleted_at: moment().toDate()});
        return result && result.affected == 1;
    }
}
