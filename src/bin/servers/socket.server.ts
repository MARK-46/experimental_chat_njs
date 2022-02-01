import {Server} from "socket.io";
import {SocketEventsEnum} from "../common/enum/socket-events.enum";
import {SocketSignalCodesEnum} from "../common/enum/socket-signal-codes.enum";
import {ConsoleColorEnum} from "../common/enum/console-color.enum";

import {createHash} from "crypto";
import {v1 as uuid} from "uuid";
import base64id_1 from "base64id";
import {SocketEventHandler} from "../../socket/socket-event.handler";
import {JsonUtility, MapUtility} from "../utils";
import {SocketClientHandler} from "../../socket/socket-client.handler";

base64id_1.generateId= function (req) {
    const res = (new Date()).toISOString() + uuid();
    return `EX__${createHash('md5').update(res).digest('hex').toUpperCase()}`;
}

export class SocketServer {
    private _server: Server;
    private _eventHandler: SocketEventHandler;
    private _clients: MapUtility<string, SocketClientHandler>;

    public create(path: string, httpServer: any): void {
        this._clients = new MapUtility<string, SocketClientHandler>();
        
        this._server = new Server(httpServer, {
            path: path,
            allowEIO3: true,
            serveClient: true,
            cors: SocketServer.cors(),
            connectTimeout: 45000,
            pingTimeout: 20000,
            maxHttpBufferSize: 204800,
        });

        this._eventHandler = new SocketEventHandler(this);
    }

    private static cors(): any {
        return {
            origin: (requestOrigin: string | undefined, next: (err: Error | null, origin?: string | undefined) => void) => next(null, requestOrigin)
        };
    }

    public send(rooms: string[], eventName: SocketEventsEnum, ...args: any): void {
        const _arguments = [];
        for (const arg of args) {
            _arguments.push(typeof arg == 'object' ? `<${JsonUtility.Stringify(arg).length} bytes>` : arg)
        }
        console.debug(`[%s] SendData to ${ConsoleColorEnum.FgCyan}%s${ConsoleColorEnum.Reset} \\ Rooms: [${ConsoleColorEnum.FgMagenta}%s${ConsoleColorEnum.Reset}] \\ Data: [${ConsoleColorEnum.FgGreen}%s${ConsoleColorEnum.Reset}]`,
            SocketServer.name, eventName, rooms.join(','), _arguments.join(', '));

        this._server.to(rooms).emit(eventName, ...args);
    }

    public sendBroadcast(exceptRooms: string[], eventName: SocketEventsEnum, ...args: any): void {
        const _arguments = [];
        for (const arg of args) {
            _arguments.push(typeof arg == 'object' ? `<${JsonUtility.Stringify(arg).length} bytes>` : arg)
        }

        console.debug(`[%s] SendData to ${ConsoleColorEnum.FgCyan}%s${ConsoleColorEnum.Reset} \\ ExceptRooms: [${ConsoleColorEnum.FgRed}%s${ConsoleColorEnum.Reset}] \\ Data: [${ConsoleColorEnum.FgGreen}%s${ConsoleColorEnum.Reset}]`, SocketServer.name,
            eventName, exceptRooms.join(','), _arguments.join(', '));

        this._server.except(exceptRooms).emit(eventName, ...args);
    }

    public sendSignal(rooms: string[], code: SocketSignalCodesEnum, data: string | object | null): void {
        this.send(rooms, SocketEventsEnum.SIGNAL, code, data);
    }

    public sendSignalBroadcast(exceptRooms: string[], code: SocketSignalCodesEnum, data: string | object | null): void {
        this.sendBroadcast(exceptRooms, SocketEventsEnum.SIGNAL, code, data);
    }

    get server(): Server {
        return this._server;
    }

    clients(room_id?: string): MapUtility<string, SocketClientHandler> {
        if (room_id) {
            const _clients = new MapUtility<string, SocketClientHandler>();
            this._clients.loop((user_id: string, client: SocketClientHandler) => {
                if (client.rooms.includes(room_id)) {
                    _clients.set(user_id, client);
                }
            });
            return _clients;
        }
        return this._clients;
    }
}
