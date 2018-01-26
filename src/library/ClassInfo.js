export default class ClassInfo {
  constructor(Class){
    this.Class = Class;
    this.name = this.Class.$name;
    this.instance = null;
  }

  setInstance(instance){
    this.instance = instance;
  }

  getDependencies = (functionName) => {
    let injectPropertyName = (functionName && `$${functionName}Deps`) || '$inject';
    return this.Class[injectPropertyName] || [];
  }

  genRunFunction = (functionName, componentMetadataMap) => {
    if(this.instance){
      return (...args) => this.instance[functionName](...args);
    }

    return (injectedResult, ...args) => {
      return new this.Class(...injectedResult.getResults(), ...args)
    };
  }
}
