import ClassInfo from './ClassInfo';
import ComponentMetadata from './ComponentMetadata';

export {
  ClassInfo,
  ComponentMetadata,
};

export default class Azldi {
  constructor(){
    this.classInfoMap = {};
    this.classInfoArray = [];
  }

  get = (name) => {
    let classInfo = this.classInfoMap[name];
    return classInfo && classInfo.instance;
  };

  getClassInfo = (name) => {
    return this.classInfoMap[name];
  };

  register(Classes){
    if(Array.isArray(Classes)){
      return Classes.map(Class => this.register(Class))
    }

    let classInfo = new ClassInfo(Classes);
    this.classInfoMap[classInfo.name] = classInfo;
    this.classInfoArray.push(classInfo);

    return true;
  }

  _run(functionName, args, appendArgs, callback, runSync = true){
    let metadataMap = {};
    let metadataArray = [];
    this.classInfoArray.map(classInfo => {
      let componentMetadata = new ComponentMetadata({
        classInfo,
        metadataMap,
        functionName,
        appendArgs: appendArgs[classInfo.name],
      });
      metadataMap[componentMetadata.name] = componentMetadata;
      metadataArray.push(componentMetadata);
    });

    let results = metadataArray.map(componentMetadata => {
      let result = componentMetadata.getProcessFunc({
        callback,
        runSync,
      })(...args);
      return result;
    });

    return runSync ? results : Promise.all(results);
  }

  digest({ onCreate = (() => {}), appendArgs = {} } = {}){
    return this._run(undefined, [], appendArgs, onCreate, true);
  }

  run(functionName, args = [], { onResult = (() => {}), appendArgs = {} } = {}){
    return this._run(functionName, args, appendArgs, onResult, true);
  }

  runAsync(functionName, args = [], { onResult = (() => {}), appendArgs = {} } = {}){
    return this._run(functionName, args, appendArgs, onResult, false);
  }
}
