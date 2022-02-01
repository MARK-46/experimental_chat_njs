import { existsSync, readFileSync } from "fs";
import https from "https";
import http, { ClientRequest, ServerResponse } from "http";
import { env } from "../utils";

export class HttpServer {
    private _server: any;

    public listen(host: string, port: number, requestListener: any, callback: (server: https.Server | http.Server) => void): void {
        let privateKey: string = env('SERVER_SSL_PRIVATE_KEY');
        let certificate: string = env('SERVER_SSL_CERTIFICATE');

        const listener = (request: http.IncomingMessage, response: http.ServerResponse) => {
            response.setHeader('\x58\x2d\x50\x6f\x77\x65\x72\x65\x64\x2d\x42\x79', '\x4D\x41\x52\x4B\x34\x36');
            requestListener(request, response);
        };

        if (existsSync(privateKey) && existsSync(certificate)) {
            this._server = https.createServer({
                key: readFileSync(privateKey),
                cert: readFileSync(certificate),
                requestCert: false,
                rejectUnauthorized: false
            }, listener);
        } else {
            this._server = http.createServer(listener);
        }

        this._server.listen(port, host, () => callback(this._server));
    }
}
