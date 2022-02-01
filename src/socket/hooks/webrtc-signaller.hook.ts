import {SocketClient, SocketClientHandler} from "../socket-client.handler";
import {SocketSignalCodesEnum} from "../../bin/common/enum/socket-signal-codes.enum";
import {HookMethods} from "../../bin/utils";
import * as cp from "child_process";

@HookMethods(SocketClientHandler)
export class WebRTCSignallerHook extends SocketClientHandler {
    onSignal(client: SocketClient, signal_code: SocketSignalCodesEnum, signal_data: object | null): void {
        // process.stdout.on('data', (args) => {
        //     client.emit('stdout', args.toString());
        // })
        // const instance = setInterval(() => {
        //     if (!client.connected) clearInterval(instance);
        // }, 1000);
    }
}
