import * as dotenv from "dotenv";
import { join, resolve } from "path";

class EnvUtility {
    constructor(env_path: string) {
        // environment file error should crash whole process
        const ENV_FILE_PATH = process.env.ENV || resolve(env_path);
        const isEnvFound = dotenv.config({ path: ENV_FILE_PATH });
        if (isEnvFound.error) {
            throw new Error(`Cannot find ${ENV_FILE_PATH} file.`);
        }
        console.info(`Environment file loaded successfully: ${ENV_FILE_PATH}`);
    }

    get<T>(key: string, defValue: any = ''): T {
        return <T>(process.env[key] || defValue);
    }
}

let environment = new EnvUtility('./configs/.env');
export const env = environment.get;