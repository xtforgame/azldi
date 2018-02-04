const privateData = new WeakMap();

export default class InjectedResult {
  constructor(metadataMap, depComponentNames){
    let deps = {};
    depComponentNames.map(depComponentName => {
      let classInfo = metadataMap[depComponentName].classInfo;
      let instance = classInfo.instance;
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

  getDepsInfo(){
    let { deps } = privateData.get(this);
    return deps;
  }

  setResults(results){
    let { depComponentNames, deps, ...rest } = privateData.get(this);
    results.map((result, i) => {
      let depComponentName = depComponentNames[i];
      deps[depComponentName]['result'] = result;
    });

    privateData.set(this, {
      depComponentNames,
      deps,
      ...rest,
      results,
    });
  }

  getResults(){
    let { results } = privateData.get(this);
    return results;
  }

  inject(results, args){
    this.setResults(results);
    return [this, ...args];
  }
}
