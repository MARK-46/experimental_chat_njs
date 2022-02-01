import {configure, getLogger} from "log4js"
import {env} from "./env.utility";
import {ConsoleColorEnum} from "../common/enum/console-color.enum";
import {format} from "util";
import moment from "moment";

function escapeStringRegexp(string) {
    if (typeof string !== 'string') {
        throw new TypeError('Expected a string');
    }
    return string
        .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        .replace(/-/g, '\\x2d');
}

configure({
    appenders: {
        cheese: {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: `${ConsoleColorEnum.FgRed}[%d] %p${ConsoleColorEnum.Reset} \b\t- ${ConsoleColorEnum.FgGreen}%x{pid}${ConsoleColorEnum.Reset} -> ${ConsoleColorEnum.FgWhite}%m ${ConsoleColorEnum.Reset}`,
                tokens: {
                    pid: function (logEvent) {
                        return logEvent.pid;
                    },
                }
            }
        },
        file: {
            type: 'file',
            filename: `logs/test-${process.pid}-${moment().format("DD-MM-YYYY")}.log`,
            layout: {
                type: 'pattern',
                pattern: `{%f{1}:%l} [%d] %p \t- %x{pid} -> %x{data}`,
                tokens: {
                    pid: function (logEvent) {
                        return logEvent.pid;
                    },
                    data: function (logEvent) {
                        const data = logEvent.data.map(_data => {
                            if (typeof _data == 'string') {
                                for (const color of Object.values(ConsoleColorEnum)) {
                                    _data = _data.replace(new RegExp(`(${escapeStringRegexp(color)})+`, 'g'), "")
                                }
                                _data = _data.replace(new RegExp(`(\b)+`, 'g'), "")
                            }
                            return _data;
                        });
                        return format(data[0], ...data.splice(1));
                    },
                }
            }
        }
    },
    categories: {default: {appenders: ["cheese", "file"], level: env<string>("SERVER_LOG_LEVEL"), enableCallStack: true}}
});

export const log4js = getLogger("cheese");

console.log = (...args: any[]) => {
    log4js.log("INFO", ...args);
}

console.error = (message: any, ...args: any[]) => {
    log4js.error(message, ...args);
}

console.warn = (message: any, ...args: any[]) => {
    log4js.warn(message, ...args);
}

console.debug = (message: any, ...args: any[]) => {
    log4js.debug(message, ...args);
}

console.info = (message: any, ...args: any[]) => {
    log4js.info(message, ...args);
}

console.trace = (message: any, ...args: any[]) => {
    log4js.trace(message, ...args);
}
