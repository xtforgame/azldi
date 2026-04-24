/* eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import Azldi, { ClassInfoRunCallbackArg, ignoredResultSymbol } from '../../src';

import {
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
} from '../test-data';

declare const describe;
declare const beforeEach;
declare const afterEach;
declare const it;

const { expect } = <any>chai;

// =============================================================================
// 1. Class Registration
// =============================================================================

describe('1. Class Registration', () => {
  it('register single class', () => {
    const azldi = new Azldi<any>();
    const result = azldi.register(SimpleA);
    expect(result).to.equal(true);
    expect(azldi.getClassInfo('simpleA')).to.exist;
    expect(azldi.getClassInfo('simpleA').Class).to.equal(SimpleA);
  });

  it('register array of classes', () => {
    const azldi = new Azldi<any>();
    const results = azldi.register([SimpleA, SimpleB, SimpleC]);
    expect(results).to.deep.equal([true, true, true]);
    expect(azldi.getClassInfo('simpleA')).to.exist;
    expect(azldi.getClassInfo('simpleB')).to.exist;
    expect(azldi.getClassInfo('simpleC')).to.exist;
  });

  it('registration order is preserved in classInfoArray', () => {
    const azldi = new Azldi<any>();
    azldi.register([SimpleC, SimpleA, SimpleB]);
    const names = azldi.classInfoArray.map(ci => ci.name);
    expect(names).to.deep.equal(['simpleC', 'simpleA', 'simpleB']);
  });

  it('getClassInfo returns undefined for unregistered name', () => {
    const azldi = new Azldi<any>();
    expect(azldi.getClassInfo('nonexistent')).to.not.exist;
  });
});

// =============================================================================
// 2. Static Metadata Properties
// =============================================================================

describe('2. Static Metadata Properties', () => {
  it('$name is stored correctly', () => {
    const azldi = new Azldi<any>();
    azldi.register(MyService00);
    expect(azldi.getClassInfo('myService00').name).to.equal('myService00');
  });

  it('$inject is accessible via getDependencies(undefined)', () => {
    const azldi = new Azldi<any>();
    azldi.register(MyService01);
    const ci = azldi.getClassInfo('myService01');
    expect(ci.getDependencies(undefined)).to.deep.equal(['myService00']);
  });

  it('$funcDeps is accessible via getDependencies(functionName)', () => {
    const azldi = new Azldi<any>();
    azldi.register(MyService01);
    const ci = azldi.getClassInfo('myService01');
    expect(ci.getDependencies('start' as any)).to.deep.equal(['myService02']);
  });

  it('$runBefore is accessible via getRunBeforeList(functionName)', () => {
    const azldi = new Azldi<any>();
    azldi.register(MyService03);
    const ci = azldi.getClassInfo('myService03');
    expect(ci.getRunBeforeList('start' as any)).to.deep.equal(['myService00']);
  });

  it('missing $inject defaults to empty', () => {
    const azldi = new Azldi<any>();
    azldi.register(SimpleA);
    const ci = azldi.getClassInfo('simpleA');
    expect(ci.getDependencies(undefined)).to.deep.equal([]);
  });

  it('missing $funcDeps returns empty for method', () => {
    const azldi = new Azldi<any>();
    azldi.register(SimpleA);
    const ci = azldi.getClassInfo('simpleA');
    expect(ci.getDependencies('doWork' as any)).to.deep.equal([]);
  });

  it('missing $runBefore returns empty for method', () => {
    const azldi = new Azldi<any>();
    azldi.register(SimpleA);
    const ci = azldi.getClassInfo('simpleA');
    expect(ci.getRunBeforeList('doWork' as any)).to.deep.equal([]);
  });
});

// =============================================================================
// 3. Dependency Resolution & Ordering
// =============================================================================

describe('3. Dependency Resolution & Ordering', () => {
  it('$funcDeps causes dep to execute before dependent (sync)', () => {
    const azldi = new Azldi<any>();
    azldi.register([DepConsumer, DepProvider]); // consumer first, provider second
    azldi.digest();

    const executionOrder: string[] = [];
    azldi.run('compute', [], {
      onResult: ({ classInfo }) => { executionOrder.push(classInfo.name); },
      sortResultsByDeps: true,
    });

    // depProvider should execute first despite being registered second
    expect(executionOrder).to.deep.equal(['depProvider', 'depConsumer']);
  });

  it('$runBefore causes source to execute before target (sync)', () => {
    runBeforeLog.length = 0;
    const azldi = new Azldi<any>();
    // Source must be registered before target for $runBefore to take effect
    azldi.register([RunBeforeSource, RunBeforeTarget]);
    azldi.digest();

    azldi.run('execute', [], { sortResultsByDeps: true });

    expect(runBeforeLog).to.deep.equal(['runBeforeSource', 'runBeforeTarget']);
  });

  it('classes with no dependency relationship execute in registration order', () => {
    const azldi = new Azldi<any>();
    azldi.register([SimpleC, SimpleA, SimpleB]); // C, A, B order
    azldi.digest();

    const executionOrder: string[] = [];
    azldi.run('doWork', [], {
      onResult: ({ classInfo }) => { executionOrder.push(classInfo.name); },
    });

    expect(executionOrder).to.deep.equal(['simpleC', 'simpleA', 'simpleB']);
  });
});

// =============================================================================
// 4. digest() — Constructor-Level DI
// =============================================================================

describe('4. digest() — Constructor-Level DI', () => {
  it('creates instances for all registered classes', () => {
    const azldi = new Azldi<any>();
    azldi.register([SimpleA, SimpleB]);
    azldi.digest();

    expect(azldi.get('simpleA')).to.be.an.instanceof(SimpleA);
    expect(azldi.get('simpleB')).to.be.an.instanceof(SimpleB);
  });

  it('injects $inject dependencies into constructor', () => {
    const azldi = new Azldi<any>();
    azldi.register([ConstructorBase, ConstructorChild]);
    azldi.digest();

    const child = azldi.get<any>('constructorChild');
    const base = azldi.get<any>('constructorBase');
    expect(child.baseRef).to.equal(base);
  });

  it('resolves dependencies in correct order regardless of registration order', () => {
    const azldi = new Azldi<MyServiceBase>();
    // Register in reverse dependency order
    azldi.register([MyService03, MyService02, MyService01, MyService00]);

    const digestOrder: string[] = [];
    azldi.digest({
      onCreate: ({ classInfo }) => { digestOrder.push(classInfo.name); },
    });

    // MyService00 has no deps -> first
    expect(digestOrder[0]).to.equal('myService00');
  });

  it('onCreate callback fires for each instantiation', () => {
    const azldi = new Azldi<any>();
    azldi.register([SimpleA, SimpleB]);

    let count = 0;
    azldi.digest({
      onCreate: ({ result, classInfo }) => {
        expect(result).to.exist;
        expect(classInfo).to.exist;
        count++;
      },
    });

    expect(count).to.equal(2);
  });

  it('digest with args passes shared args to all constructors', () => {
    const azldi = new Azldi<any>();
    azldi.register([ConstructorBase, ConstructorChild]);
    azldi.digest({ args: ['shared1', 'shared2'] });

    const base = azldi.get<any>('constructorBase');
    expect(base).to.exist;
  });

  it('digest with appendArgs passes extra args to specific class', () => {
    const azldi = new Azldi<MyServiceBase>();
    azldi.register([MyService00, MyService01, MyService02, MyService03]);
    azldi.digest({
      appendArgs: { myService02: [4, 5, 6] },
    });

    expect(azldi.get('myService00')).to.exist;
    expect(azldi.get('myService02')).to.exist;
  });

  it('digest with sortResultsByDeps returns results in dependency order', () => {
    const azldi = new Azldi<MyServiceBase>();
    azldi.register([MyService03, MyService02, MyService01, MyService00]);
    const results = azldi.digest({
      sortResultsByDeps: true,
      appendArgs: { myService02: [4, 5, 6] },
    });

    // First result should be MyService00 (no deps)
    expect(results[0]).to.be.an.instanceof(MyService00);
  });

  it('digest with onResultsInfoByDeps receives full info array', () => {
    const azldi = new Azldi<any>();
    azldi.register([SimpleA, SimpleB]);

    let info: any[] = [];
    azldi.digest({
      onResultsInfoByDeps: (args) => { info = args; },
    });

    expect(info.length).to.equal(2);
    expect(info[0].result).to.exist;
    expect(info[0].classInfo).to.exist;
  });
});

// =============================================================================
// 5. run() — Synchronous Method Execution
// =============================================================================

describe('5. run() — Synchronous Method Execution', () => {
  let azldi;

  beforeEach(() => {
    azldi = new Azldi<any>();
    azldi.register([SimpleA, SimpleB, SimpleC]);
    azldi.digest();
  });

  it('calls method on all registered classes and returns results', () => {
    const results = azldi.run('doWork');
    expect(results).to.deep.equal(['resultA', 'resultB', 'resultC']);
  });

  it('passes shared args to all methods', () => {
    const azldi2 = new Azldi<any>();
    azldi2.register([AppendArgsService, AppendArgsService2]);
    azldi2.digest();

    const results = azldi2.run('process', ['shared']);
    expect(results[0].args).to.deep.equal(['shared']);
    expect(results[1].args).to.deep.equal(['shared']);
  });

  it('returns results in registration order by default', () => {
    const results = azldi.run('doWork');
    expect(results).to.deep.equal(['resultA', 'resultB', 'resultC']);
  });

  it('InjectedResult is always prepended as first arg (even without $funcDeps)', () => {
    const azldi2 = new Azldi<any>();
    azldi2.register([AppendArgsService]);
    azldi2.digest();

    const results = azldi2.run('process', ['arg1', 'arg2']);
    // AppendArgsService.process skips _injectedResult, so args = ['arg1', 'arg2']
    expect(results[0].args).to.deep.equal(['arg1', 'arg2']);
  });
});

// =============================================================================
// 6. runAsync() — Asynchronous Method Execution
// =============================================================================

describe('6. runAsync() — Asynchronous Method Execution', () => {
  let azldi;

  beforeEach(() => {
    azldi = new Azldi<any>();
    azldi.register([SimpleA, SimpleB, SimpleC]);
    azldi.digest();
  });

  it('calls async method on all classes and returns results', async () => {
    const results = await azldi.runAsync('doWorkAsync');
    expect(results).to.deep.equal(['resultA', 'resultB', 'resultC']);
  });

  it('with sortResultsByDeps returns results in dependency order', async () => {
    const results = await azldi.runAsync('doWorkAsync', [], {
      sortResultsByDeps: true,
    });
    expect(results).to.deep.equal(['resultA', 'resultB', 'resultC']);
  });

  it('resolves $funcDeps before calling dependent (async)', async () => {
    const azldi2 = new Azldi<any>();
    azldi2.register([DepConsumer, DepProvider]);
    azldi2.digest();

    const executionOrder: string[] = [];
    const results = await azldi2.runAsync('computeAsync', [], {
      onResult: ({ classInfo }) => { executionOrder.push(classInfo.name); },
      sortResultsByDeps: true,
    });

    expect(executionOrder).to.deep.equal(['depProvider', 'depConsumer']);
    expect(results[1].received).to.deep.equal({ value: 42 });
  });
});

// =============================================================================
// 7. get() / getClassInfo() — Instance Retrieval
// =============================================================================

describe('7. get() / getClassInfo()', () => {
  it('get() returns undefined before digest', () => {
    const azldi = new Azldi<any>();
    azldi.register(SimpleA);
    expect(azldi.get('simpleA')).to.not.exist;
  });

  it('get() returns instance after digest', () => {
    const azldi = new Azldi<any>();
    azldi.register(SimpleA);
    azldi.digest();
    expect(azldi.get('simpleA')).to.be.an.instanceof(SimpleA);
  });

  it('get() returns undefined for unregistered name', () => {
    const azldi = new Azldi<any>();
    expect(azldi.get('nonexistent')).to.not.exist;
  });

  it('get() with generic type', () => {
    const azldi = new Azldi<any>();
    azldi.register(SimpleA);
    azldi.digest();
    const instance = azldi.get<SimpleA>('simpleA');
    expect(instance).to.be.an.instanceof(SimpleA);
  });

  it('getClassInfo returns ClassInfo immediately after register', () => {
    const azldi = new Azldi<any>();
    azldi.register(SimpleA);
    const ci = azldi.getClassInfo('simpleA');
    expect(ci).to.exist;
    expect(ci.name).to.equal('simpleA');
    expect(ci.Class).to.equal(SimpleA);
  });

  it('getEmptyRunResultsInfo returns empty typed array', () => {
    const azldi = new Azldi<any>();
    const info = azldi.getEmptyRunResultsInfo<string>();
    expect(info).to.be.an('array');
    expect(info.length).to.equal(0);
  });
});

// =============================================================================
// 8. InjectedResult — Dependency Access in Methods
// =============================================================================

describe('8. InjectedResult — Dependency Access in Methods', () => {
  it('getDepsInfo() returns dep results (sync)', () => {
    const azldi = new Azldi<any>();
    azldi.register([DepProvider, DepConsumer]);
    azldi.digest();

    const results = azldi.run('compute', [], { sortResultsByDeps: true });
    expect(results[0]).to.deep.equal({ value: 42 });
    expect(results[1]).to.deep.equal({ received: { value: 42 }, added: 100 });
  });

  it('getDepsInfo() returns dep results (async)', async () => {
    const azldi = new Azldi<any>();
    azldi.register([DepProvider, DepConsumer]);
    azldi.digest();

    const results = await azldi.runAsync('computeAsync', [], {
      sortResultsByDeps: true,
    });
    expect(results[0]).to.deep.equal({ value: 42 });
    expect(results[1]).to.deep.equal({ received: { value: 42 }, added: 100 });
  });

  it('getDepsInfo() includes instance and classInfo references', () => {
    const azldi = new Azldi<any>();
    azldi.register([DepProvider, DepConsumer]);
    azldi.digest();

    let capturedDeps: any = null;
    const consumer = azldi.get<any>('depConsumer');
    const origCompute = consumer.compute.bind(consumer);
    consumer.compute = (injectedResult) => {
      capturedDeps = injectedResult.getDepsInfo();
      return origCompute(injectedResult);
    };

    azldi.run('compute', [], { sortResultsByDeps: true });

    expect(capturedDeps.depProvider.instance).to.equal(azldi.get('depProvider'));
    expect(capturedDeps.depProvider.classInfo).to.exist;
    expect(capturedDeps.depProvider.result).to.deep.equal({ value: 42 });
  });
});

// =============================================================================
// 9. onResult / onCreate Callbacks
// =============================================================================

describe('9. onResult / onCreate Callbacks', () => {
  describe('onResult (run)', () => {
    it('fires for each class in execution order', () => {
      const azldi = new Azldi<any>();
      azldi.register([SimpleA, SimpleB, SimpleC]);
      azldi.digest();

      const collected: any[] = [];
      azldi.run('doWork', [], {
        onResult: ({ result, classInfo }) => {
          collected.push({ name: classInfo.name, result });
        },
      });

      expect(collected.length).to.equal(3);
      expect(collected[0]).to.deep.equal({ name: 'simpleA', result: 'resultA' });
      expect(collected[1]).to.deep.equal({ name: 'simpleB', result: 'resultB' });
      expect(collected[2]).to.deep.equal({ name: 'simpleC', result: 'resultC' });
    });

    it('does NOT fire for ignoredResultSymbol', () => {
      const azldi = new Azldi<any>({ ignoreNonexecutableByDefault: true });
      azldi.register([SimpleA, MyServiceWithoutFunctions01, MyService00, SimpleB]);
      azldi.digest();

      const collected: string[] = [];
      azldi.run('doWork', [], {
        onResult: ({ classInfo }) => { collected.push(classInfo.name); },
      });

      expect(collected).to.deep.equal(['simpleA', 'simpleB']);
    });
  });

  describe('onResult (runAsync)', () => {
    it('fires for each class in execution order', async () => {
      const azldi = new Azldi<any>();
      azldi.register([SimpleA, SimpleB]);
      azldi.digest();

      const collected: string[] = [];
      await azldi.runAsync('doWorkAsync', [], {
        onResult: ({ classInfo }) => { collected.push(classInfo.name); },
      });

      expect(collected).to.deep.equal(['simpleA', 'simpleB']);
    });
  });

  describe('onCreate (digest)', () => {
    it('fires for each class with correct result and classInfo', () => {
      const azldi = new Azldi<any>();
      azldi.register([SimpleA, SimpleB]);

      const collected: any[] = [];
      azldi.digest({
        onCreate: ({ result, classInfo }) => {
          collected.push({ name: classInfo.name, isInstance: result instanceof classInfo.Class });
        },
      });

      expect(collected).to.deep.equal([
        { name: 'simpleA', isInstance: true },
        { name: 'simpleB', isInstance: true },
      ]);
    });
  });
});

// =============================================================================
// 10. onResultsInfoByDeps Callback
// =============================================================================

describe('10. onResultsInfoByDeps Callback', () => {
  it('receives complete info array after run()', () => {
    const azldi = new Azldi<any>();
    azldi.register([SimpleA, SimpleB]);
    azldi.digest();

    let info: any[] = [];
    azldi.run('doWork', [], {
      onResultsInfoByDeps: (args) => { info = args; },
    });

    expect(info.length).to.equal(2);
    expect(info[0].result).to.equal('resultA');
    expect(info[0].classInfo.name).to.equal('simpleA');
    expect(info[1].result).to.equal('resultB');
  });

  it('receives complete info array after runAsync()', async () => {
    const azldi = new Azldi<any>();
    azldi.register([SimpleA, SimpleB]);
    azldi.digest();

    let info: any[] = [];
    await azldi.runAsync('doWorkAsync', [], {
      onResultsInfoByDeps: (args) => { info = args; },
    });

    expect(info.length).to.equal(2);
    expect(info[0].classInfo.name).to.equal('simpleA');
  });

  it('info is in execution order (deps first)', () => {
    const azldi = new Azldi<any>();
    azldi.register([DepConsumer, DepProvider]); // consumer registered first
    azldi.digest();

    let info: any[] = [];
    azldi.run('compute', [], {
      onResultsInfoByDeps: (args) => { info = args; },
    });

    expect(info[0].classInfo.name).to.equal('depProvider');
    expect(info[1].classInfo.name).to.equal('depConsumer');
  });
});

// =============================================================================
// 11. sortResultsByDeps
// =============================================================================

describe('11. sortResultsByDeps', () => {
  it('run: returns results in dependency execution order', () => {
    const azldi = new Azldi<any>();
    azldi.register([DepConsumer, DepProvider]); // reversed registration
    azldi.digest();

    const results = azldi.run('compute', [], { sortResultsByDeps: true });
    expect(results[0]).to.deep.equal({ value: 42 });
    expect(results[1].received).to.deep.equal({ value: 42 });
  });

  it('runAsync: returns results in dependency execution order', async () => {
    const azldi = new Azldi<MyServiceBase>();
    azldi.register([MyService03, MyService02, MyService01, MyService00]);
    azldi.digest({ appendArgs: { myService02: [4, 5, 6] } });

    let resultInfo: any[] = [];
    await azldi.runAsync<string>('getNameAsync', [], {
      onResultsInfoByDeps: (args) => { resultInfo = args; },
      sortResultsByDeps: true,
    });

    const order = resultInfo.map(ri => ri.classInfo.name);
    expect(order).to.deep.equal(['myService03', 'myService00', 'myService02', 'myService01']);
  });

  it('without sortResultsByDeps, results are in registration order', () => {
    const azldi = new Azldi<any>();
    azldi.register([SimpleC, SimpleA, SimpleB]);
    azldi.digest();

    const results = azldi.run('doWork');
    expect(results).to.deep.equal(['resultC', 'resultA', 'resultB']);
  });
});

// =============================================================================
// 12. appendArgs — Per-Class Extra Arguments
// =============================================================================

describe('12. appendArgs', () => {
  it('run: appends extra args only to specified class', () => {
    const azldi = new Azldi<any>();
    azldi.register([AppendArgsService, AppendArgsService2]);
    azldi.digest();

    const results = azldi.run('process', ['shared'], {
      appendArgs: { appendArgsService2: ['extra1', 'extra2'] },
    });

    expect(results[0].args).to.deep.equal(['shared']);
    expect(results[1].args).to.deep.equal(['shared', 'extra1', 'extra2']);
  });

  it('runAsync: appends extra args only to specified class', async () => {
    const azldi = new Azldi<any>();
    azldi.register([AppendArgsService, AppendArgsService2]);
    azldi.digest();

    const results = await azldi.runAsync('process', ['shared'], {
      appendArgs: { appendArgsService2: ['extra1', 'extra2'] },
    });

    expect(results[0].args).to.deep.equal(['shared']);
    expect(results[1].args).to.deep.equal(['shared', 'extra1', 'extra2']);
  });

  it('digest: appendArgs passes extra args to specific constructor', () => {
    const azldi = new Azldi<MyServiceBase>();
    azldi.register([MyService00, MyService01, MyService02, MyService03]);
    azldi.digest({
      appendArgs: { myService02: [4, 5, 6] },
    });

    expect(azldi.get('myService00')).to.exist;
    expect(azldi.get('myService01')).to.exist;
    expect(azldi.get('myService02')).to.exist;
    expect(azldi.get('myService03')).to.exist;
  });
});

// =============================================================================
// 13. ignoreNonexecutable — Skipping Missing Methods
// =============================================================================

describe('13. ignoreNonexecutable', () => {
  it('default: throws when method does not exist', () => {
    const azldi = new Azldi<any>();
    azldi.register([SimpleA]);
    azldi.digest();

    expect(() => {
      azldi.run('nonexistentMethod');
    }).to.throw();
  });

  it('ignoreNonexecutableByDefault: true skips missing methods', () => {
    const azldi = new Azldi<any>({ ignoreNonexecutableByDefault: true });
    azldi.register([SimpleA, MyServiceWithoutFunctions01, MyService00]);
    azldi.digest();

    const results = azldi.run('doWork');
    expect(results).to.deep.equal(['resultA']);
  });

  it('per-call ignoreNonexecutable: true overrides default', () => {
    const azldi = new Azldi<any>(); // default is strict
    azldi.register([SimpleA, MyServiceWithoutFunctions01, MyService00]);
    azldi.digest();

    const results = azldi.run('doWork', [], { ignoreNonexecutable: true });
    expect(results).to.deep.equal(['resultA']);
  });

  it('per-call ignoreNonexecutable: false overrides lenient default', async () => {
    const azldi = new Azldi<MyServiceBase>({ ignoreNonexecutableByDefault: true });
    azldi.register([MyService00, MyService01, MyService02, MyService03, MyServiceWithoutFunctions01]);
    azldi.digest({ appendArgs: { myService02: [4, 5, 6] } });

    let caught: any = null;
    try {
      await azldi.runAsync('start', [1, 2, 3], {
        appendArgs: { myService02: [4, 5, 6] },
        ignoreNonexecutable: false,
      });
    } catch (e) {
      caught = e;
    }
    expect(caught).to.not.equal(null);
  });

  it('ignored results are filtered from return array (run)', () => {
    const azldi = new Azldi<any>({ ignoreNonexecutableByDefault: true });
    azldi.register([SimpleA, MyServiceWithoutFunctions01, SimpleB, MyService00]);
    azldi.digest();

    const results = azldi.run('doWork');
    expect(results.length).to.equal(2);
    expect(results).to.deep.equal(['resultA', 'resultB']);
  });

  it('ignored results are filtered from return array (runAsync)', async () => {
    const azldi = new Azldi<MyServiceBase>({ ignoreNonexecutableByDefault: true });
    azldi.register([MyService00, MyService01, MyService02, MyService03, MyServiceWithoutFunctions01]);
    azldi.digest({ appendArgs: { myService02: [4, 5, 6] } });

    const result = await azldi.runAsync('start', []);
    expect(result.length).to.equal(4);
  });

  it('sortResultsByDeps + ignoreNonexecutable works correctly', async () => {
    const azldi = new Azldi<MyServiceBase>({ ignoreNonexecutableByDefault: true });
    azldi.register([MyService03, MyService00, MyService01, MyService02, MyServiceWithoutFunctions01]);
    azldi.digest({ appendArgs: { myService02: [4, 5, 6] } });

    let resultInfo: any[] = [];
    await azldi.runAsync<string>('getNameAsync', [], {
      onResultsInfoByDeps: (args) => { resultInfo = args; },
      sortResultsByDeps: true,
    });

    expect(resultInfo.length).to.equal(4);
    const runOrder = [MyService03, MyService00, MyService02, MyService01];
    runOrder.forEach((item, index) => {
      expect(resultInfo[index]).to.exist;
      expect(resultInfo[index].result).to.equal(item.$name);
    });
  });
});

// =============================================================================
// 14. shortCircuit — Early Termination
// =============================================================================

describe('14. shortCircuit', () => {
  describe('run (sync)', () => {
    it('stops after first matching result', () => {
      const azldi = new Azldi<any>();
      azldi.register([SimpleA, SimpleB, SimpleC]);
      azldi.digest();

      const results = azldi.run('findItem', [], {
        shortCircuit: ({ result }) => result != null,
      });

      // SimpleA returns null (no match), SimpleB returns { id: 1 } (match -> stop)
      // SimpleC should NOT execute
      expect(results.length).to.equal(2);
      expect(results[0]).to.equal(null);
      expect(results[1]).to.deep.equal({ id: 1, name: 'found-by-B' });
    });

    it('returns all results if nothing matches predicate', () => {
      const azldi = new Azldi<any>();
      azldi.register([SimpleA, SimpleB, SimpleC]);
      azldi.digest();

      const results = azldi.run('doWork', [], {
        shortCircuit: ({ result }) => result === 'nonexistent',
      });

      expect(results.length).to.equal(3);
    });

    it('onResult still fires for executed classes', () => {
      const azldi = new Azldi<any>();
      azldi.register([SimpleA, SimpleB, SimpleC]);
      azldi.digest();

      const onResultNames: string[] = [];
      azldi.run('findItem', [], {
        shortCircuit: ({ result }) => result != null,
        onResult: ({ classInfo }) => { onResultNames.push(classInfo.name); },
      });

      expect(onResultNames).to.deep.equal(['simpleA', 'simpleB']);
    });

    it('first class triggers short-circuit immediately', () => {
      const azldi = new Azldi<any>();
      azldi.register([SimpleB, SimpleC]); // B returns non-null for findItem
      azldi.digest();

      const results = azldi.run('findItem', [], {
        shortCircuit: ({ result }) => result != null,
      });

      expect(results.length).to.equal(1);
      expect(results[0]).to.deep.equal({ id: 1, name: 'found-by-B' });
    });
  });

  describe('runAsync', () => {
    it('stops after first matching result', async () => {
      const azldi = new Azldi<any>();
      azldi.register([SimpleA, SimpleB, SimpleC]);
      azldi.digest();

      const results = await azldi.runAsync('findItemAsync', [], {
        shortCircuit: ({ result }) => result != null,
      });

      expect(results.length).to.equal(2);
      expect(results[0]).to.equal(null);
      expect(results[1]).to.deep.equal({ id: 1, name: 'found-by-B' });
    });

    it('executes sequentially (not parallel) when shortCircuit is set', async () => {
      const azldi = new Azldi<any>();
      azldi.register([SimpleA, SimpleB, SimpleC]);
      azldi.digest();

      const executionOrder: string[] = [];
      await azldi.runAsync('findItemAsync', [], {
        shortCircuit: ({ result }) => result != null,
        onResult: ({ classInfo }) => { executionOrder.push(classInfo.name); },
      });

      // Should be sequential: A first, then B (triggers stop)
      expect(executionOrder).to.deep.equal(['simpleA', 'simpleB']);
    });
  });

  describe('Semantic A: dep triggers short-circuit, parent does NOT run', () => {
    it('dep result triggers short-circuit, parent and subsequent classes skipped', () => {
      scDepLog.length = 0;
      const azldi = new Azldi<any>();
      // Registration order: [ScDepB, ScDepC, ScDepA]
      // ScDepB depends on ScDepA via $funcDeps
      // When ScDepB's processFunc runs, it first calls ScDepA (dep)
      // ScDepA's result triggers short-circuit -> ScDepB should NOT run -> ScDepC skipped
      azldi.register([ScDepB, ScDepC, ScDepA]);
      azldi.digest();

      const results = azldi.run('find', [], {
        shortCircuit: ({ result }) => result && result.found === true,
      });

      // Only ScDepA should have executed
      expect(scDepLog).to.deep.equal(['scDepA']);
      expect(results.length).to.equal(1);
      expect(results[0]).to.deep.equal({ found: true, by: 'scDepA' });
    });
  });
});

// =============================================================================
// 15. Circular Dependency Detection
// =============================================================================

describe('15. Circular Dependency Detection', () => {
  it('throws error for circular $funcDeps', () => {
    const azldi = new Azldi<any>();
    azldi.register([CircularA, CircularB]);
    azldi.digest();

    expect(() => {
      azldi.run('run');
    }).to.throw(/Circular dependencies/);
  });
});

// =============================================================================
// 16. ignoredResultSymbol — Internal Filtering
// =============================================================================

describe('16. ignoredResultSymbol', () => {
  it('is a Symbol', () => {
    expect(typeof ignoredResultSymbol).to.equal('symbol');
  });

  it('is exported from the library', () => {
    expect(ignoredResultSymbol).to.exist;
  });

  it('non-executable methods produce ignoredResultSymbol internally', () => {
    const azldi = new Azldi<any>({ ignoreNonexecutableByDefault: true });
    azldi.register([SimpleA, MyServiceWithoutFunctions01, MyService00]);
    azldi.digest();

    // Access internal _run to see raw results (before filtering)
    const rawResults = (azldi as any)._run('doWork', [], {}, () => {}, true, {
      ignoreNonexecutable: true,
    });

    const hasIgnored = rawResults.some(r => r === ignoredResultSymbol);
    expect(hasIgnored).to.equal(true);
  });
});

// =============================================================================
// Combined $funcDeps + $runBefore
// =============================================================================

describe('Combined: $funcDeps + $runBefore ordering', () => {
  it('combBefore runs before combBase, combAfter runs after and accesses result', () => {
    combinedLog.length = 0;
    const azldi = new Azldi<any>();
    azldi.register([CombBefore, CombBase, CombAfter]);
    azldi.digest();

    const results = azldi.run('process', [], { sortResultsByDeps: true });

    expect(combinedLog).to.deep.equal(['combBefore', 'combBase', 'combAfter']);
    expect(results[2]).to.deep.equal({ baseResult: 'base-result', own: 'after-result' });
  });
});

// =============================================================================
// Edge cases
// =============================================================================

describe('Edge cases', () => {
  it('run with no args parameter uses empty array default', () => {
    const azldi = new Azldi<any>();
    azldi.register([SimpleA]);
    azldi.digest();

    const results = azldi.run('doWork');
    expect(results).to.deep.equal(['resultA']);
  });

  it('runAsync with no args parameter uses empty array default', async () => {
    const azldi = new Azldi<any>();
    azldi.register([SimpleA]);
    azldi.digest();

    const results = await azldi.runAsync('doWorkAsync');
    expect(results).to.deep.equal(['resultA']);
  });

  it('run on single class returns single-element array', () => {
    const azldi = new Azldi<any>();
    azldi.register(SimpleA);
    azldi.digest();

    const results = azldi.run('doWork');
    expect(results).to.deep.equal(['resultA']);
  });

  it('isDone prevents re-execution within same run call', () => {
    const azldi = new Azldi<any>();
    azldi.register([DepProvider, DepConsumer]);
    azldi.digest();

    let providerCallCount = 0;
    const provider = azldi.get<any>('depProvider');
    const origCompute = provider.compute.bind(provider);
    provider.compute = (...args) => {
      providerCallCount++;
      return origCompute(...args);
    };

    azldi.run('compute', [], { sortResultsByDeps: true });

    // depProvider.compute called only once (not re-executed when encountered as top-level)
    expect(providerCallCount).to.equal(1);
  });

  it('$funcDeps referencing non-existent class throws', () => {
    class BadDep {
      static $name = 'badDep';
      static $inject = [];
      static $funcDeps = { work: ['nonExistentService'] };
      work() { return 'bad'; }
    }

    const azldi = new Azldi<any>();
    azldi.register(BadDep);
    azldi.digest();

    expect(() => {
      azldi.run('work');
    }).to.throw(/Component not Found/);
  });
});

// =============================================================================
// Edge: Circular Dependency Variants
// =============================================================================

describe('Edge: Circular Dependency Variants', () => {
  it('three-way circular: A -> C -> B -> A throws', () => {
    const azldi = new Azldi<any>();
    azldi.register([TriCircA, TriCircB, TriCircC]);
    azldi.digest();

    expect(() => {
      azldi.run('run');
    }).to.throw(/Circular dependencies/);
  });

  it('self-circular: class depends on itself throws', () => {
    const azldi = new Azldi<any>();
    azldi.register(SelfCircular);
    azldi.digest();

    expect(() => {
      azldi.run('run');
    }).to.throw(/Circular dependencies/);
  });

  it('circular in async also throws', async () => {
    const azldi = new Azldi<any>();
    azldi.register([CircularA, CircularB]);
    azldi.digest();

    let caught: any = null;
    try {
      await azldi.runAsync('run');
    } catch (e) {
      caught = e;
    }
    expect(caught).to.not.equal(null);
    expect(caught.message).to.match(/Circular dependencies/);
  });
});

// =============================================================================
// Edge: Plugin Throwing Errors During Execution
// =============================================================================

describe('Edge: Plugin Throwing Errors', () => {
  it('run: error from plugin propagates', () => {
    const azldi = new Azldi<any>();
    azldi.register([ErrorPlugin]);
    azldi.digest();

    expect(() => {
      azldi.run('work');
    }).to.throw(/ErrorPlugin blew up/);
  });

  it('run: error from middle plugin stops execution', () => {
    const azldi = new Azldi<any>({ ignoreNonexecutableByDefault: true });
    azldi.register([SimpleA, ErrorPlugin, SimpleB]);
    azldi.digest();

    expect(() => {
      azldi.run('work');
    }).to.throw(/ErrorPlugin blew up/);
  });

  it('runAsync: rejected promise from plugin propagates', async () => {
    const azldi = new Azldi<any>({ ignoreNonexecutableByDefault: true });
    azldi.register([SimpleA, ErrorPlugin, SimpleB]);
    azldi.digest();

    let caught: any = null;
    try {
      await azldi.runAsync('workAsync');
    } catch (e) {
      caught = e;
    }
    expect(caught).to.not.equal(null);
    expect(caught.message).to.match(/ErrorPlugin async blew up/);
  });

  it('run: error from dep plugin propagates to dependent', () => {
    class DepOnError {
      static $name = 'depOnError';
      static $inject = [];
      static $funcDeps = { work: ['errorPlugin'] };
      work() { return 'should-not-reach'; }
    }

    const azldi = new Azldi<any>();
    azldi.register([ErrorPlugin, DepOnError]);
    azldi.digest();

    expect(() => {
      azldi.run('work');
    }).to.throw(/ErrorPlugin blew up/);
  });
});

// =============================================================================
// Edge: runAsync with Sync Functions
// =============================================================================

describe('Edge: runAsync with sync functions', () => {
  it('runAsync resolves sync return values correctly', async () => {
    const azldi = new Azldi<any>();
    azldi.register([SyncOnly]);
    azldi.digest();

    const results = await azldi.runAsync('work');
    expect(results).to.deep.equal(['sync-result']);
  });

  it('runAsync with mixed sync/async plugins (ignoreNonexecutable)', async () => {
    const azldi = new Azldi<any>({ ignoreNonexecutableByDefault: true });
    azldi.register([SyncOnly, SimpleA]);
    azldi.digest();

    const results = await azldi.runAsync('work');
    // SyncOnly.work returns 'sync-result', SimpleA has no work method (ignored)
    expect(results).to.deep.equal(['sync-result']);
  });

  it('runAsync with sortResultsByDeps resolves sync deps', async () => {
    const azldi = new Azldi<any>();
    azldi.register([DepConsumer, DepProvider]);
    azldi.digest();

    // DepProvider.compute is sync, DepConsumer.compute is sync
    // but runAsync should still handle them
    const results = await azldi.runAsync('compute', [], { sortResultsByDeps: true });
    expect(results[0]).to.deep.equal({ value: 42 });
    expect(results[1]).to.deep.equal({ received: { value: 42 }, added: 100 });
  });
});

// =============================================================================
// Edge: Complex Ordering — Registration vs Execution Order
// =============================================================================

describe('Edge: Complex Ordering', () => {
  it('deep chain: D->C->B->A registered in reverse, executes A,B,C,D', () => {
    deepChainLog.length = 0;
    const azldi = new Azldi<any>();
    // Register in reverse dependency order
    azldi.register([ChainD, ChainC, ChainB, ChainA]);
    azldi.digest();

    const executionOrder: string[] = [];
    azldi.run('work', [], {
      onResult: ({ classInfo }) => { executionOrder.push(classInfo.name); },
      sortResultsByDeps: true,
    });

    expect(deepChainLog).to.deep.equal(['chainA', 'chainB', 'chainC', 'chainD']);
    expect(executionOrder).to.deep.equal(['chainA', 'chainB', 'chainC', 'chainD']);
  });

  it('deep chain async: same order guarantee', async () => {
    deepChainLog.length = 0;
    const azldi = new Azldi<any>();
    azldi.register([ChainD, ChainC, ChainB, ChainA]);
    azldi.digest();

    const executionOrder: string[] = [];
    await azldi.runAsync('work', [], {
      onResult: ({ classInfo }) => { executionOrder.push(classInfo.name); },
      sortResultsByDeps: true,
    });

    expect(deepChainLog).to.deep.equal(['chainA', 'chainB', 'chainC', 'chainD']);
  });

  it('diamond dependency: A executes only once, order is A,B,C,D', () => {
    diamondLog.length = 0;
    const azldi = new Azldi<any>();
    // Register D first (depends on B,C), B,C depend on A
    azldi.register([DiamondD, DiamondB, DiamondC, DiamondA]);
    azldi.digest();

    const executionOrder: string[] = [];
    azldi.run('work', [], {
      onResult: ({ classInfo }) => { executionOrder.push(classInfo.name); },
      sortResultsByDeps: true,
    });

    // A should execute exactly once (isDone prevents re-execution)
    const aCount = diamondLog.filter(x => x === 'diamondA').length;
    expect(aCount).to.equal(1);
    // A must be first (both B and C depend on it)
    expect(executionOrder[0]).to.equal('diamondA');
    // D must be last (depends on B and C)
    expect(executionOrder[3]).to.equal('diamondD');
  });

  it('$runBefore: source registered after target has no effect', () => {
    // Demonstrates the $runBefore ordering constraint
    runBeforeLog.length = 0;
    const azldi = new Azldi<any>();
    // Register target FIRST, source SECOND — $runBefore won't take effect
    azldi.register([RunBeforeTarget, RunBeforeSource]);
    azldi.digest();

    azldi.run('execute', [], { sortResultsByDeps: true });

    // Target runs first because it was registered first and
    // runBeforeMap wasn't populated when target's metadata was created
    expect(runBeforeLog).to.deep.equal(['runBeforeTarget', 'runBeforeSource']);
  });

  it('registration order preserved when no deps exist', () => {
    const azldi = new Azldi<any>();
    azldi.register([SimpleC, SimpleB, SimpleA]);
    azldi.digest();

    const executionOrder: string[] = [];
    azldi.run('doWork', [], {
      onResult: ({ classInfo }) => { executionOrder.push(classInfo.name); },
      sortResultsByDeps: true,
    });

    // No deps, so execution follows registration order
    expect(executionOrder).to.deep.equal(['simpleC', 'simpleB', 'simpleA']);
  });
});
