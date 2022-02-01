import {Middleware, ExpressMiddlewareInterface} from 'routing-controllers';
import {NextFunction, Request, Response} from 'express';

@Middleware({type: 'after'})
export class CorsMiddleware implements ExpressMiddlewareInterface {
    public use(req: Request, res: Response, next?: NextFunction): void {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
        res.header("Access-Control-Allow-Headers", [
            "ex-id", "ex-authorization", "ex-language", // <- app
            "Origin", "Content-Type", "Accept", "Cache-Control",
            "Referer", "User-Agent", "sec-ch-ua-platform", "sec-ch-ua", "sec-ch-ua-mobile",
            "X-Requested-With", "Authorization", "x-client-key", "x-client-token", "x-client-secret"
        ].join(', '));
        next();
    }
}
