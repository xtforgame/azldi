const privateData = new WeakMap();

export default class InjectedResult {
  constructor(componentMetadataMap, depComponentNames){
    let deps = {};
    depComponentNames.map(depComponentName => {
      let classInfo = componentMetadataMap[depComponentName].classInfo;
      let instance = classInfo.instance;
      deps[depComponentName] = {
        classInfo,
        instance,
      };
    });

    privateData.set(this, {
      componentMetadataMap,
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
}
