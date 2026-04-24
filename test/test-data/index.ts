import InjectedResult from '../../src/InjectedResult';

// =============================================================================
// Base class (existing)
// =============================================================================

class MyServiceBase {
  start(...args) {
    return new Promise((resolve, reject) => {
      try {
        return resolve(this.onStart && this.onStart(...args));
      } catch (e) {
        return reject(e);
      }
    });
  }

  getName() {
    return '';
  }

  getNameAsync() {
    return this.getName();
  }

  onStart(..._args: any[]) {}
}

// =============================================================================
// Basic services (existing — preserved for legacy tests)
// =============================================================================

class MyService00 extends MyServiceBase {
  static $name = 'myService00';
  static $type = 'service';
  static $inject = [];
  static $funcDeps = { start: [] };

  getName() { return (<any>this.constructor).$name; }
  onStart() {}
}

class MyService01 extends MyServiceBase {
  static $name = 'myService01';
  static $type = 'service';
  static $inject = ['myService00'];
  static $funcDeps = {
    start: ['myService02'],
    getNameAsync: ['myService02'],
  };

  getName() { return (<any>this.constructor).$name; }
  onStart() {
    return new Promise((resolve) => {
      setTimeout(() => resolve((<any>this.constructor).$name), 200);
    });
  }
}

class MyService02 extends MyServiceBase {
  static $name = 'myService02';
  static $type = 'service';
  static $inject = ['myService00'];
  static $funcDeps = {
    start: ['myService00'],
    getNameAsync: ['myService00'],
  };

  getName() { return (<any>this.constructor).$name; }
  onStart() {}
}

class MyService03 extends MyServiceBase {
  static $name = 'myService03';
  static $type = 'service';
  static $inject = ['myService00'];
  static $runBefore = {
    start: ['myService00'],
    getNameAsync: ['myService00'],
  };

  getName() { return (<any>this.constructor).$name; }
  onStart() {}
}

class MyServiceWithoutFunctions01 {
  static $name = 'myServiceWithoutFunctions01';
  static $type = 'service';
  static $inject = ['myService00'];
  static $funcDeps = {};
}

// =============================================================================
// Simple independent services — for run/runAsync/shortCircuit tests
// =============================================================================

class SimpleA {
  static $name = 'simpleA';
  static $inject = [];

  doWork() { return 'resultA'; }
  doWorkAsync() { return Promise.resolve('resultA'); }
  findItem() { return null; }
  findItemAsync() { return Promise.resolve(null); }
}

class SimpleB {
  static $name = 'simpleB';
  static $inject = [];

  doWork() { return 'resultB'; }
  doWorkAsync() { return Promise.resolve('resultB'); }
  findItem() { return { id: 1, name: 'found-by-B' }; }
  findItemAsync() { return Promise.resolve({ id: 1, name: 'found-by-B' }); }
}

class SimpleC {
  static $name = 'simpleC';
  static $inject = [];

  doWork() { return 'resultC'; }
  doWorkAsync() { return Promise.resolve('resultC'); }
  findItem() { return { id: 2, name: 'found-by-C' }; }
  findItemAsync() { return Promise.resolve({ id: 2, name: 'found-by-C' }); }
}

// =============================================================================
// $funcDeps — InjectedResult tests
// =============================================================================

class DepProvider {
  static $name = 'depProvider';
  static $inject = [];

  compute() { return { value: 42 }; }
  computeAsync() { return Promise.resolve({ value: 42 }); }
}

class DepConsumer {
  static $name = 'depConsumer';
  static $inject = [];
  static $funcDeps = {
    compute: ['depProvider'],
    computeAsync: ['depProvider'],
  };

  compute(injectedResult: InjectedResult<any>) {
    const deps = injectedResult.getDepsInfo();
    return { received: deps.depProvider.result, added: 100 };
  }

  computeAsync(injectedResult: InjectedResult<any>) {
    const deps = injectedResult.getDepsInfo();
    return Promise.resolve({ received: deps.depProvider.result, added: 100 });
  }
}

// =============================================================================
// $runBefore — ordering tests
// =============================================================================

let runBeforeLog: string[] = [];

class RunBeforeTarget {
  static $name = 'runBeforeTarget';
  static $inject = [];

  execute() {
    runBeforeLog.push('runBeforeTarget');
    return 'target-done';
  }
}

class RunBeforeSource {
  static $name = 'runBeforeSource';
  static $inject = [];
  static $runBefore = { execute: ['runBeforeTarget'] };

  execute() {
    runBeforeLog.push('runBeforeSource');
    return 'source-done';
  }
}

// =============================================================================
// $funcDeps + $runBefore combined
// =============================================================================

let combinedLog: string[] = [];

class CombBase {
  static $name = 'combBase';
  static $inject = [];

  process() {
    combinedLog.push('combBase');
    return 'base-result';
  }
}

class CombBefore {
  static $name = 'combBefore';
  static $inject = [];
  static $runBefore = { process: ['combBase'] };

  process() {
    combinedLog.push('combBefore');
    return 'before-result';
  }
}

class CombAfter {
  static $name = 'combAfter';
  static $inject = [];
  static $funcDeps = { process: ['combBase'] };

  process(injectedResult: InjectedResult<any>) {
    const deps = injectedResult.getDepsInfo();
    combinedLog.push('combAfter');
    return { baseResult: deps.combBase.result, own: 'after-result' };
  }
}

// =============================================================================
// Circular dependency
// =============================================================================

class CircularA {
  static $name = 'circularA';
  static $inject = [];
  static $funcDeps = { run: ['circularB'] };
  run() { return 'a'; }
}

class CircularB {
  static $name = 'circularB';
  static $inject = [];
  static $funcDeps = { run: ['circularA'] };
  run() { return 'b'; }
}

// =============================================================================
// Constructor injection tests
// =============================================================================

class ConstructorBase {
  static $name = 'constructorBase';
  static $inject = [];
  value = 'base-value';
}

class ConstructorChild {
  static $name = 'constructorChild';
  static $inject = ['constructorBase'];

  baseRef: any;
  extraArgs: any[];

  constructor(base, ...extra) {
    this.baseRef = base;
    this.extraArgs = extra;
  }
}

// =============================================================================
// shortCircuit + dependency (Semantic A)
// Registration order: [ScDepB, ScDepC, ScDepA]
// ScDepB depends on ScDepA ($funcDeps)
// When ScDepA triggers short-circuit as dep of ScDepB, ScDepB should NOT run
// =============================================================================

let scDepLog: string[] = [];

class ScDepA {
  static $name = 'scDepA';
  static $inject = [];

  find() {
    scDepLog.push('scDepA');
    return { found: true, by: 'scDepA' };
  }
}

class ScDepB {
  static $name = 'scDepB';
  static $inject = [];
  static $funcDeps = { find: ['scDepA'] };

  find(_injectedResult: InjectedResult<any>) {
    scDepLog.push('scDepB');
    return { found: true, by: 'scDepB' };
  }
}

class ScDepC {
  static $name = 'scDepC';
  static $inject = [];

  find() {
    scDepLog.push('scDepC');
    return { found: true, by: 'scDepC' };
  }
}

// =============================================================================
// appendArgs tests
// =============================================================================

class AppendArgsService {
  static $name = 'appendArgsService';
  static $inject = [];

  process(_injectedResult, ...args) { return { name: 'svc1', args: [...args] }; }
}

class AppendArgsService2 {
  static $name = 'appendArgsService2';
  static $inject = [];

  process(_injectedResult, ...args) { return { name: 'svc2', args: [...args] }; }
}

// =============================================================================
// Error-throwing plugin
// =============================================================================

class ErrorPlugin {
  static $name = 'errorPlugin';
  static $inject = [];

  work() { throw new Error('ErrorPlugin blew up'); }
  workAsync() { return Promise.reject(new Error('ErrorPlugin async blew up')); }
}

// =============================================================================
// Three-way circular: A -> B -> C -> A
// =============================================================================

class TriCircA {
  static $name = 'triCircA';
  static $inject = [];
  static $funcDeps = { run: ['triCircC'] };
  run() { return 'a'; }
}

class TriCircB {
  static $name = 'triCircB';
  static $inject = [];
  static $funcDeps = { run: ['triCircA'] };
  run() { return 'b'; }
}

class TriCircC {
  static $name = 'triCircC';
  static $inject = [];
  static $funcDeps = { run: ['triCircB'] };
  run() { return 'c'; }
}

// =============================================================================
// Self-circular: depends on itself
// =============================================================================

class SelfCircular {
  static $name = 'selfCircular';
  static $inject = [];
  static $funcDeps = { run: ['selfCircular'] };
  run() { return 'self'; }
}

// =============================================================================
// Sync plugin used with runAsync
// =============================================================================

class SyncOnly {
  static $name = 'syncOnly';
  static $inject = [];

  work() { return 'sync-result'; }
}

// =============================================================================
// Complex ordering: deep dependency chain
// D depends on C, C depends on B, B depends on A
// Registration order: D, C, B, A (reverse)
// =============================================================================

let deepChainLog: string[] = [];

class ChainA {
  static $name = 'chainA';
  static $inject = [];
  work() { deepChainLog.push('chainA'); return 'A'; }
}

class ChainB {
  static $name = 'chainB';
  static $inject = [];
  static $funcDeps = { work: ['chainA'] };
  work(_ir) { deepChainLog.push('chainB'); return 'B'; }
}

class ChainC {
  static $name = 'chainC';
  static $inject = [];
  static $funcDeps = { work: ['chainB'] };
  work(_ir) { deepChainLog.push('chainC'); return 'C'; }
}

class ChainD {
  static $name = 'chainD';
  static $inject = [];
  static $funcDeps = { work: ['chainC'] };
  work(_ir) { deepChainLog.push('chainD'); return 'D'; }
}

// =============================================================================
// Diamond dependency: D depends on B and C, both depend on A
// =============================================================================

let diamondLog: string[] = [];

class DiamondA {
  static $name = 'diamondA';
  static $inject = [];
  work() { diamondLog.push('diamondA'); return 'A'; }
}

class DiamondB {
  static $name = 'diamondB';
  static $inject = [];
  static $funcDeps = { work: ['diamondA'] };
  work(_ir) { diamondLog.push('diamondB'); return 'B'; }
}

class DiamondC {
  static $name = 'diamondC';
  static $inject = [];
  static $funcDeps = { work: ['diamondA'] };
  work(_ir) { diamondLog.push('diamondC'); return 'C'; }
}

class DiamondD {
  static $name = 'diamondD';
  static $inject = [];
  static $funcDeps = { work: ['diamondB', 'diamondC'] };
  work(_ir) { diamondLog.push('diamondD'); return 'D'; }
}

// =============================================================================
// Exports
// =============================================================================

export {
  MyServiceBase,
  MyService00,
  MyService01,
  MyService02,
  MyService03,
  MyServiceWithoutFunctions01,
  SimpleA,
  SimpleB,
  SimpleC,
  DepProvider,
  DepConsumer,
  RunBeforeTarget,
  RunBeforeSource,
  runBeforeLog,
  CombBase,
  CombBefore,
  CombAfter,
  combinedLog,
  CircularA,
  CircularB,
  ConstructorBase,
  ConstructorChild,
  ScDepA,
  ScDepB,
  ScDepC,
  scDepLog,
  AppendArgsService,
  AppendArgsService2,
  ErrorPlugin,
  TriCircA,
  TriCircB,
  TriCircC,
  SelfCircular,
  SyncOnly,
  ChainA,
  ChainB,
  ChainC,
  ChainD,
  deepChainLog,
  DiamondA,
  DiamondB,
  DiamondC,
  DiamondD,
  diamondLog,
};
