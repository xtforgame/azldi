import ClassInfo from './ClassInfo';
import InjectedResult from './InjectedResult';

export default class ComponentMetadata {
  constructor({
    classInfo,
    metadataMap,
    functionName,
    appendArgs = [],
  }){
    this.classInfo = classInfo;
    this.metadataMap = metadataMap
    this.functionName = this.classInfo.instance && functionName;
    this.appendArgs = appendArgs;

    this.resetState();
  }

  resetState(){
    this.depResolving = false;
    this.processFunc = null;
    this.isDone = false;
    this.result = null;
  }

  get name(){
    return this.classInfo.name;
  }

  run = (functionName, args, callback) => {
    if(this.isDone){
      return this.result;
    }
    this.result = this.classInfo.run(functionName, [...args, ...this.appendArgs], callback);
    this.isDone = true;
    return this.result;
  };

  _resolve(options){
    if(this.depResolving){
      throw new Error('Circular dependencies occured :' + this.name);
    }

    this.depResolving = true;

    this.depComponentNames = this.classInfo.getDependencies(this.functionName);
    this.depRunFuncs = this.depComponentNames.map(dep => {
      let depComponentMetadata = this.metadataMap[dep];
      if(!depComponentMetadata){
        throw new Error('Component not Found :' + dep);
      }
      return depComponentMetadata.getProcessFunc(options);
    });

    this.depResolving = false;
  }

  getProcessFunc = (options = {}) => {
    if(this.processFunc){
      return this.processFunc;
    }

    let callback = options.callback || (() => {});
    let runSync = (options.runSync !== null) ? options.runSync : true;

    this._resolve(options);

    let injectedResult = new InjectedResult(this.metadataMap, this.depComponentNames);
    if(runSync){
      this.processFunc = (...args) => {
        return this.run(
          this.functionName,
          injectedResult.inject(this.depRunFuncs.map(depRunFunc => depRunFunc(...args)), args),
          callback
        );
      }
    }else{
      this.processFunc = (...args) => Promise.all(this.depRunFuncs.map(depRunFunc => depRunFunc(...args)))
      .then(results => {
        return this.run(
          this.functionName,
          injectedResult.inject(results, args),
          callback
        );
      });
    }
    return this.processFunc;
  };
}
