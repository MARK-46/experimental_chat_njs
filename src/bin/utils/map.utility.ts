export declare type ObjectType<T> = {
    new (): T;
} | Function;

export class MapUtility<K, V> extends Map {
    get<T>(key: K): T {
        return <T>super.get(key);
    }

     loop(callback: (key: K, value: V) => Promise<any> | any): Promise<void> | void {
        for (const [_key, _value] of super.entries()) {
            callback(_key, _value);
        }
    }
}
