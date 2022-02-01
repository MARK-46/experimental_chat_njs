import {SocketClient} from "../../../socket/socket-client.handler";

export interface ISocketEvents {
    onConnecting(client: SocketClient): Promise<boolean>;

    onConnected(client: SocketClient): void;

    onDisconnected(client: SocketClient): void;
}
