import { getAudioDurationInSeconds } from 'get-audio-duration';
import moment from "moment";

export class AudioUtility {
    static async getDuration(file_path: any, format: string = 'mm:ss'): Promise<string> {
        try {
            return moment.utc(await getAudioDurationInSeconds(file_path) * 1000).format(format);
        } catch (e) {
            return null;
        }
    }
}