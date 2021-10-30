import ClassInfo from './ClassInfo';

const privateData = new WeakMap();

export default class InjectedResult<ClassBase> {
  privateData2: {
    depComponentNames: {
      classInfo: ClassInfo<ClassBase>;
      instance: ClassBase;
    }
  }

  constructor(metadataMap, depComponentNames) {
    const deps = {};
    depComponentNames.forEach((depComponentName) => {
      const { classInfo } = metadataMap[depComponentName];
      const { instance } = classInfo;
      deps[depComponentName] = {
        classInfo,
        instance,
      };
    });

    this.privateData2 = {
      depComponentNames,
    };

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

  setResults(results) {
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

  inject(results, args) {
    this.setResults(results);
    return [this, ...args];
  }
}
