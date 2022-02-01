import {SocketClient, SocketClientHandler} from "../socket-client.handler";
import {SocketSignalCodesEnum} from "../../bin/common/enum/socket-signal-codes.enum";
import {HookMethods} from "../../bin/utils";
import {getCustomService} from "../../bin/utils/service-register.utility";
import {RoomRecipientService} from "../../services/room/room-recipient.service";
import {RoomRecipientTypesEnum} from "../../bin/common/enum/room-recipient-types.enum";
import {SocketSignalActions} from "../socket-signal.actions";

@HookMethods(SocketClientHandler)
export class ChatSignallerHook extends SocketClientHandler {
    onSignal(client: SocketClient, signal_code: SocketSignalCodesEnum, signal_data: object | null): void {
        if (signal_code == SocketSignalCodesEnum.CLIENT_SIGNAL_SET_MESSAGE_RECIPIENT_TYPE) {
            const data = signal_data as { room_id: string, message_id: string, type: RoomRecipientTypesEnum };
            getCustomService(RoomRecipientService).setType(data.room_id, data.message_id, client.credentials.user_id, data.type).then(isUpdated => {
                if (isUpdated) {
                    SocketSignalActions.sendCreatedRoomMessage(data.message_id);
                }
            });
        } else if (signal_code == SocketSignalCodesEnum.CLIENT_SIGNAL_TYPING_MESSAGE) {
            const data = signal_data as { room_id: string, typing: boolean };
            SocketSignalActions.sendTypingStatus(data.room_id, data.typing, client.credentials);
        }
    }
}
