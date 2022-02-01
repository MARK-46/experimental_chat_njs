export class GatewayPlatform {
    constructor(
        public status: boolean,
        public link: string,
        public message: string
    ) { }
}

export class GatewayEndpoints {
    constructor(
        public host: string,
        public socket_host: string,
        public socket_path: string
    ) { }
}

export class GatewayDataModel {
    constructor(
        public update: GatewayPlatform | null,
        public endpoints: GatewayEndpoints
    ) { }
}
