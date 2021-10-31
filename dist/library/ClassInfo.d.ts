import { ClassType, DepsMap } from './interfaces';
export declare type ClassInfoFunctionName<ClassBase> = (keyof ClassBase) | undefined;
export declare type ClassInfoRunArgs = any[];
export declare type ClassInfoRunCallbackArg<ClassBase, Result> = {
    args: any[];
    result: Result;
    classInfo: ClassInfo<ClassBase>;
};
export declare type ClassInfoRunCallback<ClassBase, Result> = (arg: ClassInfoRunCallbackArg<ClassBase, Result>) => void;
export default class ClassInfo<ClassBase> {
    Class: ClassType<ClassBase>;
    name: string;
    instance: ClassBase | undefined;
    funcDeps: DepsMap;
    runBefore: DepsMap;
    constructor(Class: ClassType<ClassBase>);
    getRunBeforeList: (functionName: ClassInfoFunctionName<ClassBase>) => import("./interfaces").Injects;
    getDependencies: (functionName: ClassInfoFunctionName<ClassBase>) => import("./interfaces").Injects;
    getRunFunction: <F = any>(functionName: ClassInfoFunctionName<ClassBase>) => F | (<F_1>(...args: any[]) => any);
    run: <T = any>(functionName: ClassInfoFunctionName<ClassBase>, args: ClassInfoRunArgs, callback: ClassInfoRunCallback<ClassBase, T>) => T;
}
