/* eslint-disable no-underscore-dangle */
import ClassInfo from './ClassInfo';
import ComponentMetadata from './ComponentMetadata';

export {
  ClassInfo,
  ComponentMetadata,
};

export default class Azldi {
  constructor() {
    this.classInfoMap = {};
    this.classInfoArray = [];
  }

  get = (name) => {
    const classInfo = this.classInfoMap[name];
    return classInfo && classInfo.instance;
  };

  getClassInfo = name => this.classInfoMap[name];

  register(Classes) {
    if (Array.isArray(Classes)) {
      return Classes.map(Class => this.register(Class));
    }

    const classInfo = new ClassInfo(Classes);
    this.classInfoMap[classInfo.name] = classInfo;
    this.classInfoArray.push(classInfo);

    return true;
  }

  _run(functionName, args, appendArgs, callback, runSync = true) {
    const metadataMap = {};
    const metadataArray = [];
    this.classInfoArray.forEach((classInfo) => {
      const componentMetadata = new ComponentMetadata({
        classInfo,
        metadataMap,
        functionName,
        appendArgs: appendArgs[classInfo.name],
      });
      metadataMap[componentMetadata.name] = componentMetadata;
      metadataArray.push(componentMetadata);
    });

    const results = metadataArray.map((componentMetadata) => {
      const result = componentMetadata.getProcessFunc({
        callback,
        runSync,
      })(...args);
      return result;
    });

    return runSync ? results : Promise.all(results);
  }

  digest({ onCreate = (() => {}), appendArgs = {} } = {}) {
    return this._run(undefined, [], appendArgs, onCreate, true);
  }

  run(functionName, args = [], { onResult = (() => {}), appendArgs = {} } = {}) {
    return this._run(functionName, args, appendArgs, onResult, true);
  }

  runAsync(functionName, args = [], { onResult = (() => {}), appendArgs = {} } = {}) {
    return this._run(functionName, args, appendArgs, onResult, false);
  }
}
