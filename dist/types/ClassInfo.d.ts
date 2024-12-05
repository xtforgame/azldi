import { ClassType, DepsMap } from './interfaces';
export type ClassInfoFunctionName<ClassBase> = (keyof ClassBase) | undefined;
export type ClassInfoRunArgs = any[];
export type ClassInfoRunOptions<ClassBase, Result> = {
    ignoreNonexecutable?: boolean | null;
};
export type ClassInfoRunCallbackArg<ClassBase, Result> = {
    args: any[];
    result: Result;
    classInfo: ClassInfo<ClassBase>;
};
export type ClassInfoRunCallback<ClassBase, Result> = (arg: ClassInfoRunCallbackArg<ClassBase, Result>) => void;
export declare const ignoredResultSymbol: unique symbol;
export declare const canBeIgnored: (ignoreNonexecutable?: boolean | null) => boolean;
export default class ClassInfo<ClassBase> {
    Class: ClassType<ClassBase>;
    name: string;
    instance: ClassBase | undefined;
    funcDeps: DepsMap;
    runBefore: DepsMap;
    constructor(Class: ClassType<ClassBase>);
    getRunBeforeList: (functionName: ClassInfoFunctionName<ClassBase>) => import("./interfaces").Injects;
    getDependencies: (functionName: ClassInfoFunctionName<ClassBase>) => import("./interfaces").Injects;
    getRunFunction: <T = any, F = any>(functionName: ClassInfoFunctionName<ClassBase>, options?: ClassInfoRunOptions<ClassBase, T>) => F | (<F_1>(...args: any[]) => any);
    run: <T = any>(functionName: ClassInfoFunctionName<ClassBase>, args: ClassInfoRunArgs, callback: ClassInfoRunCallback<ClassBase, T>, options?: ClassInfoRunOptions<ClassBase, T>) => T;
}
