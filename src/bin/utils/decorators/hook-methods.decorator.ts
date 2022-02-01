function createHook(obj: Object, targetFunction: string, hookFunction: Function) {
    let temp = obj[targetFunction];
    if (temp) {
        obj[targetFunction] = function (...args: any) {
            let ret = temp.apply(this, args);
            if (ret && typeof ret.then === 'function') {
                return ret.then((value: any) => {
                    this['_return'] = value;
                    return hookFunction.apply(this, args);
                });
            } else {
                this['_return'] = ret;
                return hookFunction.apply(this, args);
            }
        }
        return;
    }
    console.log('[DecoratorHook] Method %s not found.', targetFunction);
}

export function HookMethods(targetObj: Function) {
    return function _DecoratorHook<T extends { new(...args: any[]): {} }>(constr: T) {
        Object.getOwnPropertyNames(constr.prototype).forEach(prop => {
            if (!prop.match(/^(?:prototype|arguments|caller|name|bind|call|apply|toString|length)$/)) {
                if (targetObj.prototype[prop]) {
                    createHook(targetObj.prototype, prop, constr.prototype[prop]);
                }
            }
        });
    }
}