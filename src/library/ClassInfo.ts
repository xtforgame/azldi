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

export const ignoredResultSymbol = Symbol('ignored-result');

export const canBeIgnored = (ignoreNonexecutable?: boolean | null) => {
  return ignoreNonexecutable == null ? false : ignoreNonexecutable;
}
export default class ClassInfo<ClassBase> {
  Class: ClassType<ClassBase>;

  name: string;

  instance: ClassBase | undefined;

  funcDeps: DepsMap;

  runBefore: DepsMap;

  constructor(Class: ClassType<ClassBase>) {
    this.Class = Class;
    this.name = this.Class.$name;
    this.instance = undefined;
    this.funcDeps = this.Class.$funcDeps || {};
    this.runBefore = this.Class.$runBefore || {};
  }

  getRunBeforeList = (functionName: ClassInfoFunctionName<ClassBase>) => this.runBefore[<any>functionName] || [];

  getDependencies = (functionName: ClassInfoFunctionName<ClassBase>) => {
    if (functionName) {
      return this.funcDeps[<any>functionName] || [];
    }
    return this.Class.$inject || [];
  }

  getRunFunction = <T = any, F = any>(functionName: ClassInfoFunctionName<ClassBase>, options: ClassInfoRunOptions<ClassBase, T> = {}) => {
    if (this.instance && functionName) {
      if (!(<any>this.instance!)[functionName] && canBeIgnored(options.ignoreNonexecutable)) {
        return <F>(...args) => ignoredResultSymbol;
      }
      return <F>(...args) => (<any>this.instance!)[functionName](...args);
    }
    return <F><any>(
      (injectedResult, ...args) => {
        if (!this.instance) {
          this.instance = new this.Class(...injectedResult.getResults(), ...args);
        }
        return this.instance;
      }
    );
  }

  run = <T = any>(functionName: ClassInfoFunctionName<ClassBase>, args: ClassInfoRunArgs, callback: ClassInfoRunCallback<ClassBase, T>, options: ClassInfoRunOptions<ClassBase, T> = {}) => {
    const func = this.getRunFunction<T>(functionName, options);
    const result = (<any>func)(...args);
    if (result !== ignoredResultSymbol) {
      callback({
        args,
        result,
        classInfo: this,
      });
    }
    return <T>result;
  };
}
