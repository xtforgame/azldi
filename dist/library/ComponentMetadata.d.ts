import { Injects } from './interfaces';
import ClassInfo from './ClassInfo';
export default class ComponentMetadata<ClassBase> {
    classInfo: ClassInfo<ClassBase>;
    metadataMap: {
        [s: string]: ComponentMetadata<ClassBase>;
    };
    runBeforeList: Injects;
    functionName: string | undefined;
    appendArgs: any[];
    depComponentNames: string[];
    depRunFuncs: Function[];
    depResolving: boolean;
    processFunc: Function | null;
    isDone: boolean;
    result: any;
    constructor({ classInfo, metadataMap, runBeforeMap, functionName, appendArgs, }: {
        classInfo: any;
        metadataMap: any;
        runBeforeMap: any;
        functionName: any;
        appendArgs?: never[] | undefined;
    });
    resetState(): void;
    get name(): string;
    run: <T>(functionName: any, args: any, callback: any) => any;
    _resolve(options: any): void;
    getProcessFunc: (options?: any) => Function;
}
