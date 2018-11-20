export default class ClassInfo {
  constructor(Class) {
    this.Class = Class;
    this.name = this.Class.$name;
    this.instance = null;
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

  getRunFunction = (functionName) => {
    if (this.instance && functionName) {
      return (...args) => this.instance[functionName](...args);
    }
    return (
      (injectedResult, ...args) => {
        this.instance = this.instance || new this.Class(...injectedResult.getResults(), ...args);
        return this.instance;
      }
    );
  }

  run = (functionName, args, callback) => {
    const func = this.getRunFunction(functionName);
    const result = func(...args);
    callback({
      args,
      result,
      classInfo: this,
    });
    return result;
  };
}
