export class JsonUtility {
    static ToJSON(src: string): any {
        try {
            return JSON.parse(src);
        } catch (ignored) {
            return src;
        }
    }

    static Stringify(src: any): string {
        try {
            return JSON.stringify(src);
        } catch (ignored) {
            return src;
        }
    }
}
