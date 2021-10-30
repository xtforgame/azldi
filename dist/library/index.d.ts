import ClassInfo from './ClassInfo';
import ComponentMetadata from './ComponentMetadata';
export { ClassInfo, ComponentMetadata, };
export default class Azldi<ClassBase> {
    classInfoMap: {
        [s: string]: ClassInfo<ClassBase>;
    };
    classInfoArray: ClassInfo<ClassBase>[];
    constructor();
    get<T>(name: any): T | undefined;
    getClassInfo: (name: any) => ClassInfo<ClassBase>;
    register(Classes: any): any;
    _run(functionName: any, args: any, appendArgs: any, callback: any, runSync?: boolean): any[] | Promise<any[]>;
    digest({ onCreate, appendArgs }?: {
        onCreate?: (() => void) | undefined;
        appendArgs?: {} | undefined;
    }): any[] | Promise<any[]>;
    run<T>(functionName: any, args?: never[], { onResult, appendArgs }?: {
        onResult?: (() => void) | undefined;
        appendArgs?: {} | undefined;
    }): T[];
    runAsync<T>(functionName: any, args?: never[], { onResult, appendArgs }?: {
        onResult?: (() => void) | undefined;
        appendArgs?: {} | undefined;
    }): Promise<T>[];
}
