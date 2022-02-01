import {Validator, extend} from 'node-input-validator';
import {getConnection} from "typeorm";

extend('unique', async ({value, args}) => {
    const connectionName = args[0];
    const tableName = args[1];
    const tableColumnName = args[2];
    if (args[3]) {
        const result = await getConnection(connectionName).query(
            `SELECT EXISTS(SELECT ${tableColumnName} FROM ${tableName} WHERE ${tableColumnName} = ? AND ${tableColumnName} != ?) AS _status;`,
            [value, args[3]]);
        return result[0]['_status'] == 0;
    } else {
        const result = await getConnection(connectionName).query(
            `SELECT EXISTS(SELECT ${tableColumnName} FROM ${tableName} WHERE ${tableColumnName} = ?) AS _status;`, [value]);
        return result[0]['_status'] == 0;
    }
});

extend('regex', async ({value, args}) => {
    return new RegExp(args.join(','), 'g').test(value);
});

extend('is_object', async ({value, args}) => {
    return value ? typeof value && Array.isArray(value) == false : true;
});

extend('is_array', async ({value, args}) => {
    return value ? Array.isArray(value) : true;
});

extend('file_mimetype', async ({value, args}) => {
    return value ? value['mimetype'] && args.includes(value['mimetype']) : true;
});

extend('uuid', async ({value, args}) => {
    return new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i).test(value);
});

extend('requiredIf', async ({value, args}, validator) => {
    if (!value) {
        const anotherValue = validator.inputs[args[0]];
        const anotherValues = [];
        for (let i = 1; i < args.length; i++) {
            anotherValues.push(args[i]);
        }
        return !anotherValues.includes(anotherValue);
    }
    return true;
});

export class ValidatorUtility {
    static async check(inputs: any, rules: any, customMessages: any = undefined) {
        let v = new Validator(inputs, rules, customMessages);
        let matched = await v.check();
        if (!matched) {
            const errors = {};
            for (let [key, error] of Object.entries(v.errors)) {
                errors[key] = error['message'];
            }
            return errors;
        }
        return null;
    }
}
