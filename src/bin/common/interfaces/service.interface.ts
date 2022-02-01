export interface IService {
    use(...args: any): Promise<void>;
}