import * as multer from 'multer';
import * as crypto from 'crypto';
import fileMD5 from "md5-file";
import {extname, join} from 'path';
import {chmodSync, writeFileSync} from "fs";

export class MulterUtility {
    static get(path: string, max_size: number, types: string | undefined) {
        return {
            options: {
                limits: {
                    fieldNameSize: 255,
                    fileSize: max_size
                },
                storage: multer.diskStorage({
                    destination:async function (req, file, cb) {
                       await cb(null, `public${path}`);
                    },
                    filename: async function (req, file, cb) {
                        let name = Date.now() + MulterUtility.getStringMD5(file.originalname) + extname(file.originalname);
                        file['public_path'] = path + name;

                        const matches = file.fieldname.match(/\[[0-9]+]/g);

                        if (matches && matches.length > 0) {
                            const fName = file.fieldname.replace(/\[[0-9]+]/g, '');
                            if (!req.body[fName]) req.body[fName] = [];
                            req.body[fName].push(file);
                        } else {
                            if (!req.body[file.fieldname]) {
                                req.body[file.fieldname] = file;
                            }
                        }

                        MulterUtility.createMetadataFile(req, file, path, name);

                        await cb(null, name);
                    }
                }),
                fileFilter: function (req: any, file: any, cb: any) {
                    if (types == undefined) return cb(null, true);
                    if (types.split(',').includes(file.mimetype)) return cb(null, true);
                    return cb(new Error(`Only ${types} are allowed`), null)
                }
            }
        }
    }

    static getStringMD5(str: string): string {
        return crypto.createHash('md5').update(str).digest('hex');
    }

    static async getFileMD5(path: string): Promise<string> {
        return fileMD5.sync(path);
    }

    static createMetadataFile(req, file, path, name) {
        const metadataFile = join('public', path, name + '.metadata.json');
        const metaData = {
            file,
            request: {
                headers: req.headers,
                client_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                url: req.url
            }
        };
        // metaData.request.headers['ex-authorization'] = undefined;
        // metaData.request.headers['ex-id'] = undefined;
        writeFileSync(metadataFile, JSON.stringify(metaData, null, 2));
        chmodSync(metadataFile, "444");
    }
}
