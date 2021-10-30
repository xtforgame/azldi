export declare type Injects = string[];
export declare type DepsMap = {
    [s: string]: Injects;
};
export declare type ClassType<ClassBase> = {
    new (...args: any): ClassBase;
    $name: string;
    $inject?: Injects;
    $funcDeps?: DepsMap;
    $runBefore?: DepsMap;
};
