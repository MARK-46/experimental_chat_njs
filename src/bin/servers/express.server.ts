import * as expressCore from "express-serve-static-core";
import {resolve} from "path";
import cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import * as express from "express";
import {getMetadataArgsStorage, useExpressServer} from "routing-controllers";

// register Express Multer
import multer from 'multer';
import {connectLogger} from "log4js";
import {ConsoleColorEnum} from "../common/enum/console-color.enum";
import {log4js, MulterUtility} from "../utils";

type File = Express.Multer.File;

export class ExpressServer {
    private _express: expressCore.Express;

    public create(prefix: string, httpServer: any, controllerPaths: Function[] = [], middlewareList: Function[] = []): void {
        this._express = express.default();
        this._express.disable('x-powered-by');

        this.setLogger();
        this.setExpressOptions();
        this.setRouting(controllerPaths, middlewareList, prefix);

        this.printRoutes().forEach(route => {
            console.info(`[%s] Method: ${ConsoleColorEnum.FgCyan}%s\b%s${ConsoleColorEnum.Reset} | ${ConsoleColorEnum.FgYellow}%s`, ExpressServer.name, route.method, route.method.length > 5 ? "\t" : "\t\t", route.route);
        });
    }

    private setExpressOptions(publicDir: string = 'public'): void {
        const cors = require("cors");
        this._express.options("*", cors({origin: '*'}));
        this._express.set('views', resolve('views'));
        this._express.set('view engine', 'ejs');
        this._express.use(express.urlencoded({extended: true}));
        this._express.use(express.json());
        this._express.use(cookieParser());
        this._express.use(express.static(resolve(publicDir)));
        this._express.use(bodyParser.json());

        const file_options = MulterUtility.get('/uploads/', 5242880, undefined);
        this._express.use(multer(file_options.options).any());
    }

    private setRouting(controllers: Function[], middlewareList: Function[], prefix: string): void {
        useExpressServer(this._express, {
            routePrefix: prefix,
            controllers: controllers,
            middlewares: middlewareList,
            defaults: {
                nullResultCode: 404,
                undefinedResultCode: 204,
            },
            defaultErrorHandler: false,
        });
    }

    private setLogger(): void {
        this._express.use(connectLogger(log4js, {
            level: "info",
            format: (req: any, res: any, formatter: ((str: string) => string)) => {
                if (req.path.startsWith('/css') || req.path.startsWith('/js') ||  req.path.startsWith('/static') || 
                    req.path.startsWith('/assets') || req.path.startsWith('/favicon')) {
                    return null;
                }
                let line = `[ExpressServer] Status: ${ConsoleColorEnum.FgRed}:status${ConsoleColorEnum.Reset} | Method: ${ConsoleColorEnum.FgCyan}:method${ConsoleColorEnum.Reset}\b\t | ${ConsoleColorEnum.FgYellow}":url" ${ConsoleColorEnum.FgMagenta}(IP: :remote-addr`;
                if (req.headers['ex-id']) {
                    line += ' | SocketID: :req[ex-id]';
                }
                if (req.headers['ex-language']) {
                    line += ' | AcceptLanguage: :req[ex-language]';
                }
                if (req.headers['ex-user-id']) {
                    line += ' | UserID: :req[ex-user-id]';
                }
                if (req.headers['ex-username']) {
                    line += ' | Username: :req[ex-username]';
                }
                line += `)${ConsoleColorEnum.Reset}`;
                if (req.headers['content-length']) {
                    line += ` -> ${ConsoleColorEnum.FgRed}:response-time ms \\ ${ConsoleColorEnum.FgRed} Content-Length :content-length`;
                }
                return formatter(line);
            }
        }));
    }

    private printRoutes(): { method: string; route: string | RegExp; }[] {
        const storage = getMetadataArgsStorage();
        const {
            actions,
            controllers,
        } = storage;
        return actions.map<{ method: string; route: string | RegExp; }>((action) => {
            const {route, type} = action;
            const controller = controllers.find(controller => (
                controller.target === action.target
            ));

            if (controller == null) {
                return {
                    method: type.toUpperCase(),
                    route: route,
                };
            }

            const {
                route: baseRoute = ''
            } = controller;

            return {
                method: type.toUpperCase(),
                route: baseRoute + route,
            };
        });
    }

    get requestHandler(): expressCore.Express {
        return this._express;
    }
}
