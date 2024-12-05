import { Injects } from './interfaces';
import ClassInfo, { ClassInfoFunctionName, ClassInfoRunArgs, ClassInfoRunCallback } from './ClassInfo';
export type ComponentMetadataRunOptions<ClassBase, Result> = {
    callback?: ClassInfoRunCallback<ClassBase, Result>;
    runSync?: boolean;
    ignoreNonexecutable?: boolean | null;
};
export default class ComponentMetadata<ClassBase> {
    classInfo: ClassInfo<ClassBase>;
    metadataMap: {
        [s: string]: ComponentMetadata<ClassBase>;
    };
    runBeforeList: Injects;
    functionName: ClassInfoFunctionName<ClassBase>;
    appendArgs: ClassInfoRunArgs;
    depComponentNames: string[];
    depRunFuncs: Function[];
    depResolving: boolean;
    processFunc: Function | null;
    isDone: boolean;
    result: any;
    constructor({ classInfo, metadataMap, runBeforeMap, functionName, appendArgs, }: {
        classInfo: ClassInfo<ClassBase>;
        metadataMap: {
            [s: string]: ComponentMetadata<ClassBase>;
        };
        runBeforeMap: {
            [s: string]: Injects;
        };
        functionName: ClassInfoFunctionName<ClassBase>;
        appendArgs: ClassInfoRunArgs;
    });
    resetState(): void;
    get name(): string;
    run: <T>(functionName: ClassInfoFunctionName<ClassBase>, args: ClassInfoRunArgs, callback: ClassInfoRunCallback<ClassBase, T>, options?: ComponentMetadataRunOptions<ClassBase, T>) => any;
    _resolve<T>(options: ComponentMetadataRunOptions<ClassBase, T>): void;
    getProcessFunc: <T>(options?: ComponentMetadataRunOptions<ClassBase, T>) => Function;
}
