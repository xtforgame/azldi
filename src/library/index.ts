/* eslint-disable no-underscore-dangle */
import ClassInfo, {
  ClassInfoFunctionName,
  ClassInfoRunArgs,
  ClassInfoRunCallbackArg,
  ClassInfoRunCallback,
  ignoredResultSymbol,
} from './ClassInfo';
import ComponentMetadata, { ComponentMetadataRunOptions } from './ComponentMetadata';
import InjectedResult from './InjectedResult';

export * from './InjectedResult';
export * from './ClassInfo';
export * from './ComponentMetadata';

export {
  ClassInfo,
  InjectedResult,
  ComponentMetadata,
};

export type AppendArgsMap = {
  [s: string]: ClassInfoRunArgs;
}

export type CreateOptions<ClassBase, Result> = {
  onCreate?: ClassInfoRunCallback<ClassBase, Result>;
  args?: ClassInfoRunArgs;
  appendArgs?: AppendArgsMap;
  onResultsInfoByDeps?: (arg: ClassInfoRunCallbackArg<ClassBase, Result>[]) => void;
  sortResultsByDeps?: boolean;
};

export type RunCoreOptions<ClassBase, Result> = {
  ignoreNonexecutable?: boolean | null;
};

export type RunOptions<ClassBase, Result> = {
  onResult?: ClassInfoRunCallback<ClassBase, Result>;
  appendArgs?: AppendArgsMap;
  onResultsInfoByDeps?: (arg: ClassInfoRunCallbackArg<ClassBase, Result>[]) => void;
  sortResultsByDeps?: boolean;
  ignoreNonexecutable?: boolean | null;
};

export type AzldiOptions<ClassBase> = {
  ignoreNonexecutableByDefault?: boolean | null;
}

export default class Azldi<ClassBase> {
  classInfoMap: { [s: string]: ClassInfo<ClassBase> };

  classInfoArray: ClassInfo<ClassBase>[];

  options: AzldiOptions<ClassBase>;

  constructor(options: AzldiOptions<ClassBase> = {}) {
    this.classInfoMap = {};
    this.classInfoArray = [];
    this.options = options;
  }

  get<T=any>(name) : T | undefined {
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

  _run<T>(
    functionName: ClassInfoFunctionName<ClassBase>,
    args: ClassInfoRunArgs,
    appendArgs: AppendArgsMap,
    callback, runSync = true,
    options: RunCoreOptions<ClassBase, T> = {},
  ) {
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
      const result = componentMetadata.getProcessFunc<T>({
        callback,
        runSync,
        ignoreNonexecutable: options.ignoreNonexecutable,
      })(...args);
      return result;
    });

    return runSync ? results : Promise.all(results);
  }

  digest({
    onCreate = (() => {}),
    args = [],
    appendArgs = {},
    onResultsInfoByDeps,
    sortResultsByDeps,
  } : CreateOptions<ClassBase, ClassBase> = {}) {
    let cb = onCreate;
    const resultsInfo: ClassInfoRunCallbackArg<ClassBase, ClassBase>[] = [];
    if (onResultsInfoByDeps || sortResultsByDeps) {
      cb = (args) => {
        resultsInfo.push(args);
        onCreate(args);
      }
    }
    const results = this._run(undefined, args, appendArgs, cb, true);
    if (onResultsInfoByDeps) {
      onResultsInfoByDeps(resultsInfo);
    }
    if (sortResultsByDeps) {
      return resultsInfo.map(ri => ri.result);
    }
    return results;
  }

  getEmptyRunResultsInfo<T=any>() {
    return [] as ClassInfoRunCallbackArg<ClassBase, T>[];
  }

  run<T=any>(functionName: ClassInfoFunctionName<ClassBase>, args: ClassInfoRunArgs = [], {
    onResult = (() => {}),
    appendArgs = {},
    onResultsInfoByDeps,
    sortResultsByDeps,
    ignoreNonexecutable,
  }: RunOptions<ClassBase, T> = {}): T[] {
    let cb = onResult;
    const resultsInfo: ClassInfoRunCallbackArg<ClassBase, T>[] = [];
    if (onResultsInfoByDeps || sortResultsByDeps) {
      cb = (args) => {
        resultsInfo.push(args);
        onResult(args);
      }
    }
    const result = <any>this._run(functionName, args, appendArgs, cb, true, {
      ignoreNonexecutable: ignoreNonexecutable == null ? this.options.ignoreNonexecutableByDefault : ignoreNonexecutable,
    });
    if (onResultsInfoByDeps) {
      onResultsInfoByDeps(resultsInfo);
    }
    if (sortResultsByDeps) {
      return resultsInfo.map(ri => ri.result);
    }
    return result.filter(r => r !== ignoredResultSymbol);
  }

  runAsync<T=any>(functionName: ClassInfoFunctionName<ClassBase>, args: ClassInfoRunArgs = [], {
    onResult = (() => {}),
    appendArgs = {},
    onResultsInfoByDeps,
    sortResultsByDeps,
    ignoreNonexecutable,
  }: RunOptions<ClassBase, T> = {}) : Promise<T[]> {
    let cb = onResult;
    const resultsInfo: ClassInfoRunCallbackArg<ClassBase, T>[] = [];
    if (onResultsInfoByDeps || sortResultsByDeps) {
      cb = (args) => {
        resultsInfo.push(args);
        onResult(args);
      }
    }
    return (this._run(functionName, args, appendArgs, cb, false, {
      ignoreNonexecutable: ignoreNonexecutable == null ? this.options.ignoreNonexecutableByDefault : ignoreNonexecutable,
    }) as Promise<any[]>)
    .then((result) => {
      if (onResultsInfoByDeps) {
        onResultsInfoByDeps(resultsInfo);
      }
      if (sortResultsByDeps) {
        return resultsInfo.map(ri => ri.result);
      }
      return <any>result.filter(r => r !== ignoredResultSymbol);
    });

  }
}
