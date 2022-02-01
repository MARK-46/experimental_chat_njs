import {NextFunction, Request, Response} from 'express';
import {Middleware, ExpressErrorMiddlewareInterface} from 'routing-controllers';
import {responseError} from "../bin/utils/response.utility";

@Middleware({type: 'after'})
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
    async error(error: any, req: Request, res: Response, next: NextFunction) {
        if (!res.headersSent) {
            const status = error.status || 500;
            const message = `Server error (500) - ${error.message}` || 'Server error (500)';
            responseError(res, null, {}, message, status);
            console.error('Server error (500) -', error);
        }
        res.end();
    }
}
