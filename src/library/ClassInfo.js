export default class ClassInfo {
  constructor(Class){
    this.Class = Class;
    this.name = this.Class.$name;
    this.instance = null;
    this.funcDeps = this.Class['$funcDeps'] || {};
  }

  getDependencies = (functionName) => {
    if(functionName){
      return this.funcDeps[functionName] || [];
    }
    return this.Class['$inject'] || [];
  }

  getRunFunction = (functionName) => {
    if(this.instance && functionName){
      return (...args) => this.instance[functionName](...args);
    }
    return ((injectedResult, ...args) => {
      return this.instance = this.instance || new this.Class(...injectedResult.getResults(), ...args);
    });
  }

  run = (functionName, args, callback) => {
    let func = this.getRunFunction(functionName);
    let result = func(...args);
    callback({
      args,
      result,
      classInfo: this,
    });
    return result;
  };
}
