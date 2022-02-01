function copyProps(target: any, source: any) {
    Object.getOwnPropertyNames(source)
        .concat(Object.getOwnPropertySymbols(source) as any)
        .forEach((prop) => {
            if (!prop.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/))
                Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
        });
}

export function Extends(...mixins: any[]) {
    return function _DecoratorExtends<T extends { new(...args: any[]): {} }>(constr: T) {
        mixins.forEach((mixin) => {
            copyProps(constr.prototype, mixin.prototype);
            copyProps(constr.prototype, mixin);
        });
        return class extends constr {
            constructor(...args: any[]) {
                super(...args);
                mixins.forEach((mixin) => {
                    copyProps(constr.prototype, (new mixin));
                });
            }
        }
    }
}