import { UserDataModel } from "./user-data.model";

export class TokenDataModel {
    constructor(
        public token: string,
        public expires_at: Date,
        public created_at: Date,
    ) { }
}

export class AuthResponseModel {
    constructor(
        public access_token: TokenDataModel,
        public refresh_token: TokenDataModel,
        public user: UserDataModel
    ) { }
}
