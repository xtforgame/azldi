import { ClassType, DepsMap } from './interfaces';

export type ClassInfoFunctionName<ClassBase> = (keyof ClassBase) | undefined;
export type ClassInfoRunArgs = any[];

export type ClassInfoRunCallbackArg<ClassBase, Result> = {
  args: any[];
  result: Result;
  classInfo: ClassInfo<ClassBase>;
};
export type ClassInfoRunCallback<ClassBase, Result> = (arg: ClassInfoRunCallbackArg<ClassBase, Result>) => void;

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

  getRunFunction = <F = any>(functionName: ClassInfoFunctionName<ClassBase>) => {
    if (this.instance && functionName) {
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

  run = <T = any>(functionName: ClassInfoFunctionName<ClassBase>, args: ClassInfoRunArgs, callback: ClassInfoRunCallback<ClassBase, T>) => {
    const func = this.getRunFunction(functionName);
    const result = (<any>func)(...args);
    callback({
      args,
      result,
      classInfo: this,
    });
    return <T>result;
  };
}
