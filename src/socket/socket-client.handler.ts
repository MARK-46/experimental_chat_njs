import { Socket } from "socket.io";
import { UserDataModel } from "../models/responses/user-data.model";
import { ISocketEvents } from "../bin/common/interfaces/socket-events.interface";
import { env, MapUtility, L } from "../bin/utils";
import { ConsoleColorEnum } from "../bin/common/enum/console-color.enum";
import { SocketEventsEnum } from "../bin/common/enum/socket-events.enum";
import { SocketSignalCodesEnum } from "../bin/common/enum/socket-signal-codes.enum";
import { socketServer } from "../index";
import { PacketType } from "../bin/common/enum/packet-type.enum";
import { AuthAccessTokenEntity } from "../database/entities/auth-access-token.entity";

// @ts-ignore
Socket.prototype.kick = function (reason: string) {
    this.packet({ type: PacketType.CONNECT, data: { sid: -1 } });
    this.packet({ type: PacketType.EVENT, data: ['_signal', SocketSignalCodesEnum.SIGNAL_KICK, reason] });
    this.disconnect(false);
    console.debug(`[%s] ${ConsoleColorEnum.FgRed}CONNECTION_KICKED: %s:%s - %s - Reason: %s `, SocketClientHandler.name,
            this.request.socket.remoteAddress, this.request.socket.remotePort, this.id, reason);
}

Socket.prototype._onconnect = function () {
    this.packet({
        type: PacketType.CONNECT, data: {
            sid: this.id,
            credentials: this.credentials,
            '\x50\x6f\x77\x65\x72\x65\x64\x42\x79': '\x4D\x41\x52\x4B\x34\x36'
        }
    });
    this.join(this.id);
    this.join(env('SERVER_SOCKET_MAIN_ROOM'));
    if (this.credentials)
        this.join(this.credentials.user_id);
}

export class SocketClient extends Socket {
    public credentials: UserDataModel = null;
    public handler: SocketClientHandler = null;
    public token: AuthAccessTokenEntity = null;

    public kick(reason: string) { }
}

export class SocketClientHandler implements ISocketEvents {
    public sockets: MapUtility<string, SocketClient> = new MapUtility<string, SocketClient>();
    public credentials: UserDataModel;
    public rooms: string[] = [];

    public join(room: string, client: SocketClient): void {
        client.join(room);
        this.rooms.push(room);
    }

    public leave(room: string, client: SocketClient): void {
        client.leave(room);
        this.rooms = this.rooms.filter(_room => room != _room);
    }

    /*
        EVENTS
     */

    async onConnecting(client: SocketClient): Promise<boolean> {
        console.debug(`[%s] ${ConsoleColorEnum.FgRed}NEW_CONNECTION: %s:%s - %s - %s \n\t{'%s' '%s'}`, SocketClientHandler.name,
            client.request.socket.remoteAddress, client.request.socket.remotePort, client.credentials.user_id, client.credentials.user_username, client.id, client.handshake.query['ex-authorization']);
        return true;
    }

    onConnected(client: SocketClient): void {
        this.online(client);
        client.on(SocketEventsEnum.SIGNAL, (signal_code: SocketSignalCodesEnum, signal_data: object | null) => {
            this.onSignal(client, signal_code, signal_data);
        });
    }

    onDisconnected(client: SocketClient): void {
        this.offline(client);

        console.debug(`[%s] ${ConsoleColorEnum.FgRed}DISCONNECTED: %s:%s - %s - %s - %s`, SocketClientHandler.name,
            client.request.socket.remoteAddress, client.request.socket.remotePort, client.credentials.user_id, client.credentials.user_username, client.id);
    }

    onSignal(client: SocketClient, signal_code: SocketSignalCodesEnum, signal_data: object | null): void {
        console.debug(`[%s] OnSignal: User ${ConsoleColorEnum.FgRed}%s${ConsoleColorEnum.Reset} -> SignalCode: ${ConsoleColorEnum.FgCyan}%s${ConsoleColorEnum.Reset} | SignalData: ${ConsoleColorEnum.FgGreen}%s${ConsoleColorEnum.Reset}`, SocketClientHandler.name,
            client.credentials.user_username, signal_code.toString(), signal_data);
    }

    /*
        Any
     */

    private online(client: SocketClient): void {
        this.credentials.user_online = true;

        socketServer.sendSignal([this.credentials.user_id],
            SocketSignalCodesEnum.SIGNAL_PROFILE, this.credentials);

        socketServer.sendSignalBroadcast([this.credentials.user_id],
            SocketSignalCodesEnum.SIGNAL_CLIENT_ONLINE, client.credentials);

        socketServer.clients().loop(async (user_id, _client) => {
            if (client.credentials.user_id != user_id) {
                socketServer.sendSignal([this.credentials.user_id],
                    SocketSignalCodesEnum.SIGNAL_CLIENT_ONLINE, _client.credentials);
            }
        });
    }

    private offline(client: SocketClient): void {
        client.credentials.user_online = this.sockets.size > 1;
        socketServer.sendSignalBroadcast([this.credentials.user_id],
            SocketSignalCodesEnum.SIGNAL_CLIENT_OFFLINE, client.credentials);
    }
}
