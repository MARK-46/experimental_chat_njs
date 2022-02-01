export interface IMulterFile extends Express.Multer.File {
    public_path: string;
}
