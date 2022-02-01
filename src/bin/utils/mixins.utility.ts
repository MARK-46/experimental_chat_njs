export class MixinsUtility {
    static apply<T extends any>(constructors: any[]): T {
        class Mixins {  }
        let type: any = Mixins;
        constructors.forEach((baseCtor) => {
            Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
                Object.defineProperty(
                    Mixins.prototype,
                    name,
                    Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
                    Object.create(null)
                );
            });
        });
        return new type();
    }
}
