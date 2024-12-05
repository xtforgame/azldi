import ClassInfo from './ClassInfo';

const privateData = new WeakMap();

export default class InjectedResult<ClassBase> {
  constructor(
    metadataMap: any,
    depComponentNames: string[],
  ) {
    const deps: any = {};
    depComponentNames.forEach((depComponentName) => {
      const { classInfo } = metadataMap[depComponentName];
      const { instance } = classInfo;
      deps[depComponentName] = {
        classInfo,
        instance,
      };
    });

    privateData.set(this, {
      metadataMap,
      depComponentNames,
      deps,
    });
  }

  getDepsInfo() {
    const { deps } = privateData.get(this);
    return deps;
  }

  setResults(results: any[]) {
    const { depComponentNames, deps, ...rest } = privateData.get(this);
    results.forEach((result, i) => {
      if (i < depComponentNames.length) {
        const depComponentName = depComponentNames[i];
        deps[depComponentName].result = result;
      }
    });

    privateData.set(this, {
      depComponentNames,
      deps,
      ...rest,
      results,
    });
  }

  getResults() {
    const { results } = privateData.get(this);
    return results;
  }

  inject(results: any[], args: any[]) {
    this.setResults(results);
    return [this, ...args];
  }
}
