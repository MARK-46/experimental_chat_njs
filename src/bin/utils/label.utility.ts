import applicationLabels from "../common/labels";

class LabelUtility {
    static find(key: string, code: string, ...args: any[]): any {
        if (applicationLabels[key]) {
            if (applicationLabels[key][(code || "").toLocaleUpperCase()]) {
                let label = applicationLabels[key][(code || "").toLocaleUpperCase()];
                if (args && args.length != 0 && typeof args[0] === 'object') {
                    args = args[0];
                }
                for (let i = 0; i < args.length; i++) {
                    label = label.replace(`{${i}}`, args[i]);
                }
                return label;
            }
        }
        return `${key}.${(code || "").toLocaleUpperCase()}`;
    }
}

export const L = LabelUtility.find;
