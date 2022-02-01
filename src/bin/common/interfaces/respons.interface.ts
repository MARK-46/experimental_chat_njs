export interface IResponse {
    error: boolean;
    message: string | null;
    data: {
        result?: object | object[] | null
    };
}
