import { ClassType, DepsMap } from './interfaces';
export default class ClassInfo<ClassBase> {
    Class: ClassType<ClassBase>;
    name: string;
    instance: ClassBase | undefined;
    funcDeps: DepsMap;
    runBefore: DepsMap;
    constructor(Class: ClassType<ClassBase>);
    getRunBeforeList: (functionName: any) => import("./interfaces").Injects;
    getDependencies: (functionName: any) => import("./interfaces").Injects;
    getRunFunction: <F = any>(functionName: any) => F | (<F_1>(...args: any[]) => any);
    run: <T = any>(functionName: any, args: any, callback: any) => T;
}
