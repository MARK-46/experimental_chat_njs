import { IMulterFile } from "../../bin/common/interfaces/multer-file.interface";

export class LoginRequestModel {
    constructor(
        public username: string,
        public password: string,
    ) { }
}

export class RegisterRequestModel {
    constructor(
        public name: string,
        public email: string,
        public username: string,
        public password: string,
        public confirm_password: string,
        public avatar: IMulterFile,
    ) { }
}

export class RefreshTokenRequestModel {
    constructor(
        public refresh_token: string,
    ) { }
}
