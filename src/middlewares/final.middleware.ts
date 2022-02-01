import {Middleware, ExpressMiddlewareInterface} from 'routing-controllers';
import {NextFunction, Response} from 'express';
import {responseError} from "../bin/utils/response.utility";
import {L} from "../bin/utils";
import {StatusCodesEnum} from "../bin/common/enum/status-codes.enum";
import {IRequest} from "../bin/common/interfaces/request.interface";

@Middleware({type: 'after'})
export class FinalMiddleware implements ExpressMiddlewareInterface {
    public use(req: IRequest, res: Response, next?: NextFunction) {
        if (!res.headersSent) {
            responseError(res, null, {}, L('ROUTE_NOT_FOUND', req.language_code), StatusCodesEnum.NOT_FOUND);
        }
        res.end();
    }
}
