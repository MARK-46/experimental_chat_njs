import {ExpressMiddlewareInterface, Middleware} from "routing-controllers";
import {NextFunction, Response} from "express";
import {IRequest} from "../bin/common/interfaces/request.interface";
import {env} from "../bin/utils";

@Middleware({ type: 'before' })
export class LanguageCodeMiddleware implements ExpressMiddlewareInterface {
    public static languageCodes: string[] = ["EN", "RU"];

    public use(req: IRequest, res: Response, next?: NextFunction): void {
        req.language_code = LanguageCodeMiddleware.getCode(req.header('ex-language'));
        next();
    }

    public static getCode(exLanguage: string): string {
        let language_code = env<string>('SERVER_DEFAULT_LANGUAGE', 'en').toUpperCase();
        let languageCode: string = exLanguage || '';
        if (LanguageCodeMiddleware.languageCodes.includes(languageCode.toUpperCase())) {
            language_code = languageCode.toUpperCase();
        }
        return language_code;
    }
}
