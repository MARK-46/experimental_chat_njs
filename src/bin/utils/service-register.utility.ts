import { MapUtility, ObjectType } from "./index";
import {IService} from "../common/interfaces/service.interface";
import {ConsoleColorEnum} from "../common/enum/console-color.enum";

const instances: MapUtility<string, IService> = new MapUtility();

export function getCustomService<T>(customService: ObjectType<T>): T {
    return instances.get(customService.name);
}

export async function setCustomService<T>(customService: ObjectType<T>, ...args: any): Promise<T> {
    const instance = new (customService as any)();
    instances.set(customService.name, instance);
    await instance.use(...args);
    console.log(`Service loaded: ${ConsoleColorEnum.FgRed}%s${ConsoleColorEnum.Reset}`, customService.name);
    return instance;
}
