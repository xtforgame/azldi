/* eslint-disable no-underscore-dangle */
import InjectedResult from './InjectedResult';
import { ClassType, DepsMap, Injects } from './interfaces';
import ClassInfo, {
  ClassInfoFunctionName,
  ClassInfoRunArgs,
  ClassInfoRunCallback,
} from './ClassInfo';

export type ComponentMetadataRunOptions<ClassBase, Result> = {
  callback?: ClassInfoRunCallback<ClassBase, Result>;
  runSync?: boolean;
  ignoreNonexecutable?: boolean | null;
};

export default class ComponentMetadata<ClassBase> {
  classInfo: ClassInfo<ClassBase>;

  metadataMap: { [s: string]: ComponentMetadata<ClassBase> };

  runBeforeList: Injects;

  functionName: ClassInfoFunctionName<ClassBase>;

  appendArgs: ClassInfoRunArgs;

  depComponentNames: string[];

  depRunFuncs: Function[];

  depResolving: boolean;

  processFunc: Function | null;

  isDone: boolean;

  result: any;

  constructor({
    classInfo,
    metadataMap,
    runBeforeMap,
    functionName,
    appendArgs = [],
  }: {
    classInfo: ClassInfo<ClassBase>;
    metadataMap: { [s: string]: ComponentMetadata<ClassBase> };
    runBeforeMap: { [s: string]: Injects };
    functionName: ClassInfoFunctionName<ClassBase>;
    appendArgs: ClassInfoRunArgs;
  }) {
    this.classInfo = classInfo;
    this.metadataMap = metadataMap;
    this.runBeforeList = runBeforeMap[this.name] || [];
    this.functionName = this.classInfo.instance && functionName;
    this.appendArgs = appendArgs;

    this.depComponentNames = [];
    this.depRunFuncs = [];

    this.depResolving = false;
    this.processFunc = null;
    this.isDone = false;
    this.result = null;
  }

  resetState() {
    this.depResolving = false;
    this.processFunc = null;
    this.isDone = false;
    this.result = null;
  }

  get name() {
    return this.classInfo.name;
  }

  run = <T>(
    functionName: ClassInfoFunctionName<ClassBase>,
    args: ClassInfoRunArgs,
    callback: ClassInfoRunCallback<ClassBase, T>,
    options: ComponentMetadataRunOptions<ClassBase, T> = {}
  ) => {
    if (this.isDone) {
      return this.result;
    }
    this.result = this.classInfo.run(functionName, [...args, ...this.appendArgs], callback, { ignoreNonexecutable: options.ignoreNonexecutable });
    this.isDone = true;
    return this.result as T;
  };

  _resolve<T>(options: ComponentMetadataRunOptions<ClassBase, T>) {
    if (this.depResolving) {
      throw new Error(`Circular dependencies occured :${this.name}`);
    }

    this.depResolving = true;

    this.depComponentNames = this.classInfo.getDependencies(this.functionName);
    this.depRunFuncs = [...this.depComponentNames, ...this.runBeforeList].map((dep) => {
      const depComponentMetadata = this.metadataMap[dep];
      if (!depComponentMetadata) {
        throw new Error(`Component not Found :${dep}`);
      }
      return depComponentMetadata.getProcessFunc(options);
    });

    this.depResolving = false;
  }

  getProcessFunc = <T>(options: ComponentMetadataRunOptions<ClassBase, T> = {}) => {
    if (this.processFunc) {
      return this.processFunc;
    }

    const callback : ClassInfoRunCallback<ClassBase, any> = options.callback || (() => {});
    const runSync = (options.runSync !== null) ? options.runSync : true;

    this._resolve(options);

    const injectedResult = new InjectedResult<ClassBase>(this.metadataMap, this.depComponentNames);
    if (runSync) {
      this.processFunc = (...args: any[]) => this.run(
        this.functionName,
        injectedResult.inject(this.depRunFuncs.map(depRunFunc => depRunFunc(...args)), args),
        callback,
        options
      );
    } else {
      this.processFunc = (...args: any[]) => Promise.all(this.depRunFuncs.map(depRunFunc => depRunFunc(...args)))
      .then(results => this.run(
        this.functionName,
        injectedResult.inject(results, args),
        callback,
        options
      ));
    }
    return this.processFunc;
  };
}
