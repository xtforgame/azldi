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

    this.containerInterface = {
      get: this.get,
    };
  }

  get = (name) => {
    let metadata = this.classInfoMap[name];
    return metadata && metadata.inst;
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

  _run(functionName, args, callback, runSync = true){
    let componentMetadataMap = {};
    let componentMetadataArray = [];
    this.classInfoArray.map(classInfo => {
      let componentMetadata = new ComponentMetadata({
        classInfo,
        componentMetadataMap,
        functionName,
        runSync,
      });
      componentMetadataMap[componentMetadata.name] = componentMetadata;
      componentMetadataArray.push(componentMetadata);
    });

    let results = componentMetadataArray.map(componentMetadata => {
      let result = componentMetadata.getProcessFunc({ callback })(...args);
      return result;
    });

    if(runSync){
      return results;
    }

    return Promise.all(results);
  }

  digest({ onCreate = (() => {}) } = {}){
    let cb = data => {
      let {result, classInfo} = data;
      this.classInfoMap[classInfo.name].setInstance(result);
      onCreate(data);
    }

    return this._run(undefined, [], cb, true);
  }


  start(...args){
    return this._run('start', [...args], undefined, false);
  }

  run(functionName, args, { onResult = (() => {}) } = {}){
    return this._run(functionName, args, onResult, true);
  }

  runAsync(functionName, args, { onResult = (() => {}) } = {}){
    return this._run(functionName, args, onResult, false);
  }
}
