import { Get, JsonController, QueryParam, Req, Res } from "routing-controllers";
import { Response } from "express";
import { StatusCodesEnum } from "../bin/common/enum/status-codes.enum";

import gateway_config from "../../configs/gateway.config";
import { responseError, response, responseValidationError } from "../bin/utils/response.utility";
import { IResponse } from "../bin/common/interfaces/respons.interface";
import { L, ValidatorUtility } from "../bin/utils";
import { IRequest } from "../bin/common/interfaces/request.interface";
import { GatewayEndpoints, GatewayPlatform, GatewayDataModel } from "../models/responses/gateway-data.model";

@JsonController()
export class GatewayController {
    @Get("/")
    index(@Res() res: Response, @Req() req: IRequest) {
        res.render('index.ejs');
    }

    @Get("/api/gateway")
    async gateway(@Res() res: Response, @Req() req: IRequest,
        @QueryParam('version') version: string,
        @QueryParam('platform') platform: string
    ): Promise<Response<IResponse>> {
        res.set('Cache-Control', 'no-store');

        const validatorResult = await ValidatorUtility.check({ version, platform }, {
            "version": "required|string",
            "platform": "required|string|in:android,ios,web",
        });

        if (validatorResult) {
            return responseValidationError(res, req, validatorResult);
        }

        if (!gateway_config.hasOwnProperty(version)) {
            return responseError(res, null, {}, L('NOT_FOUND', req.language_code, version), StatusCodesEnum.NOT_FOUND);
        }

        if (!gateway_config[version]['update'].hasOwnProperty(platform)) {
            return responseError(res, null, {}, L('NOT_FOUND', req.language_code, platform), StatusCodesEnum.NOT_FOUND);
        }

        const data = new GatewayDataModel(
            gateway_config[version]['update'][platform] ? new GatewayPlatform(
                gateway_config[version]['update'][platform]['status'],
                gateway_config[version]['update'][platform]['link'],
                gateway_config[version]['update'][platform]['message'],
            ) : null,
            new GatewayEndpoints(
                gateway_config[version]['endpoints']['host'],
                gateway_config[version]['endpoints']['socket_host'],
                gateway_config[version]['endpoints']['socket_path'],
            )
        );
        return response(res, false, data, {}, null);
    }
}
