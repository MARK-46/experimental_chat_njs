import {IResponse} from "../common/interfaces/respons.interface";
import {Response} from "express";
import {StatusCodesEnum} from "../common/enum/status-codes.enum";
import {L} from "./label.utility";
import {IRequest} from "../common/interfaces/request.interface";

export function response(res: Response, error: boolean, result: object | object[], data: object,
                         message: string | null, status: number = StatusCodesEnum.SUCCESS): Response<IResponse> {
    const response = {} as IResponse;
    response.error = error;
    response.message = message;
    if (result == null) {
        response.data = {...data};
    } else {
        response.data = {...data, result: result};
    }
    return res.status(status).json(response);
}

export function responseError(res: Response, result: object | object[], data: object,
                              message: string | null, status: number = StatusCodesEnum.BAD_REQUEST): Response<IResponse> {
    return response(res, true, result, data, message, status);
}

export function responseValidationError(res: Response, req: IRequest, validatorResult: any): Response<IResponse> {
    return response(res, true, validatorResult, {}, L('VALIDATION_ERROR', req.language_code), StatusCodesEnum.UNPROCESSABLE_ENTITY);
}
