import {extname, join} from "path";
import {Connection, createConnections, getConnection} from "typeorm";
import {env} from "../utils";
import {ConsoleColorEnum} from "../common/enum/console-color.enum";

export class DatabaseClient {
    connect(callBack: (err: Error | null, connections: Connection[]) => Promise<void>): void {
        createConnections(DatabaseClient.getDatabaseConnections()).then(async (connections) => {
            await DatabaseClient.setTimeZoneForce();
            await callBack(null, connections);
        }).catch(async (error) => {
            await callBack(error, null);
        });
    }

    private static async setTimeZoneForce() {
        for (let i = 0; i < 10; i++) {
            if (env(`DB${i}_NAME`, false)) {
                await getConnection(env(`DB${i}_NAME`)).manager.query(`SET GLOBAL time_zone = '${env(`DB${i}_TIMEZONE`)}';`)
                await getConnection(env(`DB${i}_NAME`)).manager.query(`SET time_zone = '${env(`DB${i}_TIMEZONE`)}';`)
            }
        }
    }

    private static getDatabaseConnections(): any {
        let connections = [];
        for (let i = 0; i < 10; i++) {
            if (env(`DB${i}_NAME`, false)) {
                connections.push({
                    name: env(`DB${i}_NAME`),
                    type: env(`DB${i}_TYPE`),
                    host: env(`DB${i}_HOST`),
                    port: env<number>(`DB${i}_PORT`),
                    username: env(`DB${i}_USERNAME`),
                    password: env(`DB${i}_PASSWORD`),
                    database: env(`DB${i}_DATABASE`),
                    timezone: env(`DB${i}_TIMEZONE`),
                    charset: env(`DB${i}_CHARSET`),
                    synchronize: env(`DB${i}_SYNCHRONIZE`) == 'true',
                    logging: env<string>(`DB${i}_LOGGING`, '').split(','),
                    entities: this.getEntityPaths(i)
                });
            }
        }
        return connections;
    }

    private static getEntityPaths(dbNumber: number): string[] {
        const paths = [];

        const entityType = extname(__filename);

        paths.push(...env<string>(`DB${dbNumber}_ENTITIES`).split(',')
            .filter(_fileName => _fileName.length > 0)
            .map(_fileName => {
                const filePath = join(__dirname, '../..', 'database/entities', "/**/**/", _fileName + ".entity" + entityType);
                console.log(`Loading entity (${entityType}): ${ConsoleColorEnum.FgRed}%s${ConsoleColorEnum.Reset}`, filePath);
                return filePath;
            }));

        return paths;
    }
}
