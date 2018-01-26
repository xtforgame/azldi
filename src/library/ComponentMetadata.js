import ClassInfo from './ClassInfo';
import InjectedResult from './InjectedResult';

export default class ComponentMetadata {
  constructor({
    classInfo,
    componentMetadataMap,
    functionName,
    runSync = true,
  }){
    this.classInfo = classInfo;
    this.componentMetadataMap = componentMetadataMap

    this.runSync = runSync;
    this.functionName = this.classInfo.instance && functionName;
    this.depResolving = false;
    this.processFunc = null;
    this.result = null;
  }

  get name(){
    return this.classInfo.name;
  }

  run = (func, args, callback) => {
    if(this.result){
      return this.result;
    }
    this.result = func(...args);
    callback({
      result: this.result,
      classInfo: this.classInfo,
    });
    return this.result;
  };

  getProcessFunc = (options = {}) => {
    if(this.processFunc){
      return this.processFunc;
    }

    let callback = options.callback || (() => {});

    if(this.depResolving){
      throw new Error('Circular dependencies occured :' + this.name);
    }

    this.depResolving = true;

    this.depComponentNames = this.classInfo.getDependencies(this.functionName);
    this.depClassInfos = {};
    this.depRunFuncs = this.depComponentNames.map(dep => {
      let depComponentMetadata = this.componentMetadataMap[dep];
      if(!depComponentMetadata){
        throw new Error('Component not Found :' + dep);
      }
      this.depClassInfos[depComponentMetadata.name] = depComponentMetadata.classInfo;
      return depComponentMetadata.getProcessFunc(options);
    });

    this.depResolving = false;

    let functionName = this.functionName;
    let func = this.classInfo.genRunFunction(functionName, this.componentMetadataMap);
    let injectedResult = new InjectedResult(this.componentMetadataMap, this.depComponentNames);
    if(this.runSync){
      this.processFunc = (...args) => {
        let results = this.depRunFuncs.map(depRunFunc => depRunFunc(...args));
        injectedResult.setResults(results);
        return this.run(func, [injectedResult, ...args], callback);
      }
    }else{
      this.processFunc = (...args) => Promise.all(this.depRunFuncs.map(depRunFunc => depRunFunc(...args)))
      .then(results => {
        injectedResult.setResults(results);
        return this.run(func, [injectedResult, ...args], callback);
      });
    }
    return this.processFunc;
  };
}
