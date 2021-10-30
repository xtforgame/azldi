import { ClassType, DepsMap } from './interfaces';

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

  getRunBeforeList = functionName => this.runBefore[functionName] || [];

  getDependencies = (functionName) => {
    if (functionName) {
      return this.funcDeps[functionName] || [];
    }
    return this.Class.$inject || [];
  }

  getRunFunction = <F = any>(functionName) => {
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

  run = <T = any>(functionName, args, callback) => {
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
