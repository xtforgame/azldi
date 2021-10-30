/* eslint-disable no-underscore-dangle */
import ClassInfo from './ClassInfo';
import ComponentMetadata from './ComponentMetadata';

export {
  ClassInfo,
  ComponentMetadata,
};
export default class Azldi<ClassBase> {
  classInfoMap: { [s: string]: ClassInfo<ClassBase> };

  classInfoArray: ClassInfo<ClassBase>[];

  constructor() {
    this.classInfoMap = {};
    this.classInfoArray = [];
  }

  get<T>(name) : T | undefined {
    const classInfo = this.classInfoMap[name];
    return classInfo && (<T><any>classInfo.instance);
  };

  getClassInfo = name => this.classInfoMap[name];

  register(Classes) {
    if (Array.isArray(Classes)) {
      return Classes.map(Class => this.register(Class));
    }

    const classInfo = new ClassInfo<ClassBase>(Classes);
    this.classInfoMap[classInfo.name] = classInfo;
    this.classInfoArray.push(classInfo);

    return true;
  }

  _run(functionName, args, appendArgs, callback, runSync = true) {
    const metadataMap = {};
    const runBeforeMap = {};
    const metadataArray : ComponentMetadata<ClassBase>[] = [];
    this.classInfoArray.forEach((classInfo) => {
      classInfo.getRunBeforeList(functionName).forEach(
        dep => (runBeforeMap[dep] = [...(runBeforeMap[dep]) || [], classInfo.name])
      );
      const componentMetadata = new ComponentMetadata<ClassBase>({
        classInfo,
        metadataMap,
        runBeforeMap,
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

  run<T>(functionName, args = [], { onResult = (() => {}), appendArgs = {} } = {}): T[] {
    return <any>this._run(functionName, args, appendArgs, onResult, true);
  }

  runAsync<T>(functionName, args = [], { onResult = (() => {}), appendArgs = {} } = {}) : Promise<T[]> {
    return <any>this._run(functionName, args, appendArgs, onResult, false);
  }
}
