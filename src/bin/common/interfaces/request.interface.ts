import {Request} from 'express-serve-static-core';
import {UserDataModel} from "../../../models/responses/user-data.model";
import {SocketClient, SocketClientHandler} from "../../../socket/socket-client.handler";

export interface IRequest extends Request {
    credentials: UserDataModel;
    language_code: string;
    socketClient: SocketClient;
    socketClientHandler: SocketClientHandler;
}
