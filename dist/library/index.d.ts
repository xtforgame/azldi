import ClassInfo, { ClassInfoFunctionName, ClassInfoRunArgs, ClassInfoRunCallbackArg, ClassInfoRunCallback } from './ClassInfo';
import ComponentMetadata from './ComponentMetadata';
import InjectedResult from './InjectedResult';
export * from './InjectedResult';
export * from './ClassInfo';
export * from './ComponentMetadata';
export { ClassInfo, InjectedResult, ComponentMetadata, };
export declare type AppendArgsMap = {
    [s: string]: ClassInfoRunArgs;
};
export declare type CreateOptions<ClassBase, Result> = {
    onCreate?: ClassInfoRunCallback<ClassBase, Result>;
    args?: ClassInfoRunArgs;
    appendArgs?: AppendArgsMap;
    onResultsInfoByDeps?: (arg: ClassInfoRunCallbackArg<ClassBase, Result>[]) => void;
    sortResultsByDeps?: boolean;
};
export declare type RunCoreOptions<ClassBase, Result> = {
    ignoreNonexecutable?: boolean | null;
};
export declare type RunOptions<ClassBase, Result> = {
    onResult?: ClassInfoRunCallback<ClassBase, Result>;
    appendArgs?: AppendArgsMap;
    onResultsInfoByDeps?: (arg: ClassInfoRunCallbackArg<ClassBase, Result>[]) => void;
    sortResultsByDeps?: boolean;
    ignoreNonexecutable?: boolean | null;
};
export declare type AzldiOptions<ClassBase> = {
    ignoreNonexecutableByDefault?: boolean | null;
};
export default class Azldi<ClassBase> {
    classInfoMap: {
        [s: string]: ClassInfo<ClassBase>;
    };
    classInfoArray: ClassInfo<ClassBase>[];
    options: AzldiOptions<ClassBase>;
    constructor(options?: AzldiOptions<ClassBase>);
    get<T = any>(name: any): T | undefined;
    getClassInfo: (name: any) => ClassInfo<ClassBase>;
    register(Classes: any): any;
    _run<T>(functionName: ClassInfoFunctionName<ClassBase>, args: ClassInfoRunArgs, appendArgs: AppendArgsMap, callback: any, runSync?: boolean, options?: RunCoreOptions<ClassBase, T>): any[] | Promise<any[]>;
    digest({ onCreate, args, appendArgs, onResultsInfoByDeps, sortResultsByDeps, }?: CreateOptions<ClassBase, ClassBase>): any[] | Promise<any[]>;
    getEmptyRunResultsInfo<T = any>(): ClassInfoRunCallbackArg<ClassBase, T>[];
    run<T = any>(functionName: ClassInfoFunctionName<ClassBase>, args?: ClassInfoRunArgs, { onResult, appendArgs, onResultsInfoByDeps, sortResultsByDeps, ignoreNonexecutable, }?: RunOptions<ClassBase, T>): T[];
    runAsync<T = any>(functionName: ClassInfoFunctionName<ClassBase>, args?: ClassInfoRunArgs, { onResult, appendArgs, onResultsInfoByDeps, sortResultsByDeps, ignoreNonexecutable, }?: RunOptions<ClassBase, T>): Promise<T[]>;
}
