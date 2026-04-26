# AZLDI Feature Specification

Complete feature inventory for the azldi library, derived from source code analysis (`azldi/src/library/`) and real-world usage patterns across the project.

---

## Table of Contents

1. [Class Registration](#1-class-registration)
2. [Static Metadata Properties](#2-static-metadata-properties)
3. [Dependency Resolution & Ordering](#3-dependency-resolution--ordering)
4. [digest() — Constructor-Level DI](#4-digest--constructor-level-di)
5. [run() — Synchronous Method Execution](#5-run--synchronous-method-execution)
6. [runAsync() — Asynchronous Method Execution](#6-runasync--asynchronous-method-execution)
7. [get() / getClassInfo() — Instance Retrieval](#7-get--getclassinfo--instance-retrieval)
8. [InjectedResult — Dependency Access in Methods](#8-injectedresult--dependency-access-in-methods)
9. [onResult / onCreate Callbacks](#9-onresult--oncreate-callbacks)
10. [onResultsInfoByDeps Callback](#10-onresultsinfobydeps-callback)
11. [sortResultsByDeps](#11-sortresultsbydeps)
12. [appendArgs — Per-Class Extra Arguments](#12-appendargs--per-class-extra-arguments)
13. [ignoreNonexecutable — Skipping Missing Methods](#13-ignorenonexecutable--skipping-missing-methods)
14. [shortCircuit — Early Termination](#14-shortcircuit--early-termination)
15. [Circular Dependency Detection](#15-circular-dependency-detection)
16. [ignoredResultSymbol — Internal Filtering](#16-ignoredresultsymbol--internal-filtering)

---

## 1. Class Registration

### API

```typescript
azldi.register(Class)          // single class
azldi.register([Class1, Class2]) // array of classes
```

### Behavior

- Each class must have a static `$name` property (unique identifier).
- Registers a `ClassInfo<ClassBase>` wrapper around the class.
- Stored in both `classInfoMap` (by name) and `classInfoArray` (ordered by registration).
- Registration order determines iteration order in `_run` (affects execution order for classes without dependency relationships).
- Calling `register` with a duplicate `$name` overwrites the map entry but appends another entry to the array (this is likely unintended usage — should be tested/documented).

### Source

- [index.ts](../src/library/index.ts) `register()` method
- [ClassInfo.ts](../src/library/ClassInfo.ts) constructor

---

## 2. Static Metadata Properties

Each registered class can declare the following static properties:

| Property | Required | Type | Purpose |
|----------|----------|------|---------|
| `$name` | **Yes** | `string` | Unique identifier for DI resolution |
| `$type` | No | `string` | Category label (e.g. `'service'`, `'controller'`) — not used internally |
| `$inject` | No | `string[]` | Constructor dependencies — resolved during `digest()` |
| `$funcDeps` | No | `{ [method: string]: string[] }` | Method-level dependencies — resolved during `run()`/`runAsync()` |
| `$runBefore` | No | `{ [method: string]: string[] }` | Declares "this class's method should run BEFORE the listed classes" |

### $inject

```typescript
class HttpApp {
  static $name = 'httpApp';
  static $inject = ['envCfg', 'resourceManager'];
  constructor(envCfg, resourceManager) { ... }
}
```

- Resolved during `digest()`. The injected dependencies are passed as constructor arguments in the order listed.
- Can be empty `[]` (no constructor deps) or omitted entirely.
- Can be dynamically assembled: `static $inject = ['httpApp', ...plugins.map(p => p.$name)]`.

### $funcDeps

```typescript
class HttpApp {
  static $funcDeps = {
    start: ['routerManager', 'mailer'],
  };
}
```

- Declares that `HttpApp.start()` depends on `routerManager` and `mailer`.
- When `run('start')` or `runAsync('start')` is called, `routerManager.start()` and `mailer.start()` execute first.
- Their results are injected via `InjectedResult` as the first argument to `HttpApp.start()`.

### $runBefore

```typescript
class MinioApi {
  static $runBefore = {
    start: ['httpApp'],
  };
}
```

- The inverse of `$funcDeps`: declares "my `start()` should run BEFORE `httpApp`'s `start()`".
- Equivalent to `httpApp` having `$funcDeps = { start: ['minioApi'] }`, but defined from the other side.
- Useful when the dependent class shouldn't know about the dependency.

### Source

- [interfaces.ts](../src/library/interfaces.ts) `ClassType<ClassBase>`
- [ClassInfo.ts](../src/library/ClassInfo.ts) `getDependencies()`, `getRunBeforeList()`

---

## 3. Dependency Resolution & Ordering

### How Dependencies Are Resolved

1. **Before execution**, `_run()` builds a `ComponentMetadata` for each registered class.
2. Each `ComponentMetadata` collects:
   - `depComponentNames`: from `$funcDeps[functionName]` (or `$inject` for digest)
   - `runBeforeList`: other classes that declared `$runBefore` pointing at this class
3. `getProcessFunc()` lazily resolves the dependency graph:
   - Calls `_resolve()` which recursively calls `getProcessFunc()` on each dependency
   - The returned `processFunc` closure first executes all deps, then executes self
4. `isDone` flag prevents re-execution — a class runs at most once per `_run()` call.

### Execution Order

Given classes [A, B, C] registered in that order:
- If B depends on A (`$funcDeps = { start: ['a'] }`): A runs first (as B's dep), then B, then C.
- If A has `$runBefore = { start: ['c'] }`: A runs before C.
- Classes with no dependency relationship execute in registration order.

### Source

- [ComponentMetadata.ts](../src/library/ComponentMetadata.ts) `_resolve()`, `getProcessFunc()`

---

## 4. digest() — Constructor-Level DI

### API

```typescript
azldi.digest(options?: CreateOptions)
```

### Options

```typescript
type CreateOptions<ClassBase, Result> = {
  onCreate?: ({ args, result, classInfo }) => void;
  args?: any[];
  appendArgs?: { [className: string]: any[] };
  onResultsInfoByDeps?: (info[]) => void;
  sortResultsByDeps?: boolean;
};
```

### Behavior

- Instantiates all registered classes in dependency order.
- Constructor receives: `(injectedResult: InjectedResult, ...args, ...appendArgs)`.
  - `injectedResult.getResults()` returns the instances of `$inject` dependencies.
  - `args` are the shared args passed to `digest({ args })`.
  - `appendArgs` are per-class extra arguments.
- After instantiation, `classInfo.instance` is set (accessible via `azldi.get()`).
- Returns array of instances (or sorted by deps if `sortResultsByDeps: true`).

### Real-world Usage

```typescript
// Basic
ioc.digest();

// With args passed to all constructors
ioc.digest({ args: [{ getPlugin }] });

// With per-class extra args and creation callback
ioc.digest({
  onCreate: ({ result, classInfo }) => { ... },
  appendArgs: { myService02: [4, 5, 6] },
});
```

### Source

- [index.ts](../src/library/index.ts) `digest()`
- [ClassInfo.ts](../src/library/ClassInfo.ts) `getRunFunction()` (the `functionName === undefined` branch)

---

## 5. run() — Synchronous Method Execution

### API

```typescript
azldi.run<T>(functionName, args?, options?): T[]
```

### Options

```typescript
type RunOptions<ClassBase, Result> = {
  onResult?: ({ args, result, classInfo }) => void;
  appendArgs?: { [className: string]: any[] };
  onResultsInfoByDeps?: (info[]) => void;
  sortResultsByDeps?: boolean;
  ignoreNonexecutable?: boolean | null;
  shortCircuit?: ({ args, result, classInfo }) => boolean;
};
```

### Behavior

- Calls `functionName` on every registered class's instance (that has the method).
- Method receives: `(injectedResult: InjectedResult, ...args, ...appendArgs)`.
  - `InjectedResult` is only prepended if the class has `$funcDeps` for this method.
  - If no `$funcDeps`, method receives just `(...args, ...appendArgs)`.
- Returns array of results from all classes.
- Results from `ignoredResultSymbol` (non-executable methods when ignored) are filtered out.

### Real-world Usage

```typescript
// Basic collection pattern
const routers = pluginMgr.ioc.run('getApiKoaRouters', [], {
  sortResultsByDeps: true,
}).reduce((all, r) => [...all, ...r], []);

// With onResult for immediate processing
const schemas = pluginMgr.ioc.run('getJsonSchema', [], {
  sortResultsByDeps: true,
  onResult: ({ result, classInfo: { name } }) => {
    Object.values(result.models).forEach(m => {
      m.extraOptions.createdByPlugin = name;
    });
  },
});

// Side-effect invocation (no result needed)
pluginMgr.ioc.run('beforeHandleRequest', [ctx]);

// Passing object as argument
pluginMgr.ioc.run('patchJsonSchema', [{ getSchemas, setSchemas }], {
  sortResultsByDeps: true,
});
```

### Source

- [index.ts](../src/library/index.ts) `run()`, `_run()`

---

## 6. runAsync() — Asynchronous Method Execution

### API

```typescript
azldi.runAsync<T>(functionName, args?, options?): Promise<T[]>
```

### Options

Same as `run()`.

### Behavior

- Same as `run()` but handles Promise-returning methods.
- Dependencies are resolved via `Promise.all()` before the dependent method executes.
- **Execution mode** (since v1.1.1):

  | 條件 | top-level | sibling deps inside `processFunc` |
  |------|-----------|-----------------------------------|
  | 無 `onResult` 無 `shortCircuit` | parallel (`Promise.all`) | parallel (`Promise.all`) |
  | 有 `onResult` 無 `shortCircuit` | **sequential** (`for...of + await`) | **sequential** |
  | 無 `onResult` 有 `shortCircuit` | sequential | parallel |
  | 有 `onResult` 有 `shortCircuit` | sequential | **sequential** |

  Mnemonic: **`onResult` triggers both levels sequential; `shortCircuit` triggers only top-level sequential.**

- **Callback timing for async methods** (since v1.1.1): `onResult` / `onResultsInfoByDeps` always receive the **resolved value**, never a `Promise`. `ClassInfo.run` defers callback firing via `.then()` when the method returns a thenable.
- Final results are awaited via `Promise.all()` before returning.

### Sequential Semantics & Transform Chain

The sequential mode (triggered by `onResult`) is what makes the transform-chain pattern work: each plugin's `onResult` completes its mutation of shared state (typically captured by a getter passed in `args`) before the next plugin's body reads that state.

```typescript
let value = 100;
const getValue = () => value;

await azldi.runAsync('transform', [getValue], {
  onResult: ({ result }) => { if (result != null) value = result; },
});
// PluginA reads getValue() = 100, returns 110 → onResult sets value = 110
// PluginB reads getValue() = 110 (sequential), returns 130 → onResult sets value = 130
```

When `onResult` is provided, this guarantee extends **both to top-level classes and to sibling `$funcDeps` / `$runBefore` of any single class**. Sibling deps fire in registration order, never racing through `Promise.all`.

Without `onResult` (or `shortCircuit`), `runAsync` stays parallel for performance.

### Real-world Usage

```typescript
// Lifecycle sequence
await ioc.runAsync('start');
await ioc.runAsync('allInstantiated', [ioc]);
await ioc.runAsync('allStarted');

// With options
await pluginMgr.ioc.runAsync('setupHttpServers', [this, {}], {
  ignoreNonexecutable: true,
  sortResultsByDeps: true,
});

// Event notification pattern
await pluginMgr.ioc.runAsync('paid', [{
  resourceManager, orderId, transaction,
}]);
```

### Source

- [index.ts](../src/library/index.ts) `runAsync()`, `_run()`

---

## 7. get() / getClassInfo() — Instance Retrieval

### API

```typescript
azldi.get<T>(name: string): T | undefined
azldi.getClassInfo(name: string): ClassInfo<ClassBase>
```

### Behavior

- `get()`: Returns the instantiated instance (set after `digest()`). Returns `undefined` if not found or not yet digested.
- `getClassInfo()`: Returns the `ClassInfo` wrapper. Available immediately after `register()`.

### Real-world Usage

```typescript
const minioApi = ioc.get<Minio>('minioApi')!;
const classInfo = azldi.getClassInfo(Class.$name);
```

### Source

- [index.ts](../src/library/index.ts) `get()`, `getClassInfo`

---

## 8. InjectedResult — Dependency Access in Methods

### API

```typescript
class InjectedResult<ClassBase> {
  getDepsInfo(): { [depName: string]: { classInfo, instance, result } }
  getResults(): any[]
  setResults(results: any[]): void
  inject(results, args): [this, ...args]
}
```

### Behavior

- Created per-method-call per-class in `getProcessFunc()`.
- `getDepsInfo()`: Returns map of dependency names to `{ classInfo, instance, result }`.
  - `result` is populated after deps execute (via `setResults()`).
  - `instance` is the dep's class instance.
- `getResults()`: Returns raw array of dep results (used internally by `digest()` to pass to constructors).
- `inject()`: Sets results and prepends self to args array — this is how `InjectedResult` becomes the first argument to methods with `$funcDeps`.

### Usage in Methods

```typescript
class DataProcessor {
  static $funcDeps = { processData: ['dataCollector'] };

  processData(injectedResult: InjectedResult<Base>) {
    const deps = injectedResult.getDepsInfo();
    const collectedData = deps.dataCollector.result;
    // ... use collectedData
  }
}
```

### Source

- [InjectedResult.ts](../src/library/InjectedResult.ts)
- [ComponentMetadata.ts](../src/library/ComponentMetadata.ts) `getProcessFunc()`

---

## 9. onResult / onCreate Callbacks

### onResult (for run / runAsync)

```typescript
onResult: ({ args, result, classInfo }) => void
```

- Called after each class's method executes.
  - **`run` (sync)**: fired synchronously inside `ClassInfo.run` immediately after the method returns.
  - **`runAsync`** (since v1.1.1): fired after the method's returned Promise resolves, with the resolved value as `result`. Internally `ClassInfo.run` chains `.then()` so the callback is part of the awaited Promise chain — the next class's body does not start until the previous `onResult` has fired.
- NOT called for `ignoredResultSymbol` results (non-executable methods).
- Fires in execution order (deps first, then dependents).
- Receives the method result and access to `classInfo` (including `classInfo.name`).
- **Side effect**: passing `onResult` to `runAsync` switches execution from parallel to sequential (see §6 Sequential Semantics).

### onCreate (for digest)

```typescript
onCreate: ({ args, result, classInfo }) => void
```

- Called immediately after each class is instantiated during `digest()`.
- `result` is the newly created instance.
- Same callback signature as `onResult`.

### Source

- [ClassInfo.ts](../src/library/ClassInfo.ts) `run()` — fires callback after function execution
- [index.ts](../src/library/index.ts) `digest()`, `run()`

---

## 10. onResultsInfoByDeps Callback

### API

```typescript
onResultsInfoByDeps: (info: ClassInfoRunCallbackArg[]) => void
```

Where each entry is:
```typescript
{ args: any[], result: T, classInfo: ClassInfo<ClassBase> }
```

### Behavior

- Receives the **complete** array of result info objects after all execution finishes.
- Results are in **execution order** (dependency order), not registration order.
- Only includes classes that actually produced results (excludes `ignoredResultSymbol`).
- Available on `run()`, `runAsync()`, and `digest()`.
- **For `runAsync`** (since v1.1.1): each `result` field is the resolved value, never a `Promise`. (Previously, async methods caused entries to contain unresolved Promises.)

### Source

- [index.ts](../src/library/index.ts) — collected via callback wrapping in `run()`/`runAsync()`/`digest()`

---

## 11. sortResultsByDeps

### API

```typescript
{ sortResultsByDeps: true }
```

### Behavior

- When `true`, the return value of `run()`/`runAsync()`/`digest()` is ordered by **execution order** (dependency-resolved order) instead of registration order.
- Internally uses the same `resultsInfo` collection mechanism as `onResultsInfoByDeps`.
- This is the most commonly used option in the real-world codebase.

### Source

- [index.ts](../src/library/index.ts) — `resultsInfo.map(ri => ri.result)` branch

---

## 12. appendArgs — Per-Class Extra Arguments

### API

```typescript
{ appendArgs: { [className: string]: any[] } }
```

### Behavior

- Appends additional arguments to a specific class's method call (or constructor for `digest()`).
- The extra args are concatenated after the shared `args`.
- Method signature: `method(injectedResult?, ...sharedArgs, ...appendArgs)`.
- Available on `run()`, `runAsync()`, and `digest()`.

### Example

```typescript
azldi.run('processData', [sharedArg], {
  appendArgs: {
    myService02: [4, 'extra', 6],  // only myService02 gets these
  },
});
// myService02.processData(injectedResult, sharedArg, 4, 'extra', 6)
// other classes:  .processData(injectedResult, sharedArg)
```

### Source

- [ComponentMetadata.ts](../src/library/ComponentMetadata.ts) `run()` — `[...args, ...this.appendArgs]`
- [index.ts](../src/library/index.ts) `_run()` — `appendArgs: appendArgs[classInfo.name]`

---

## 13. ignoreNonexecutable — Skipping Missing Methods

### API

```typescript
// Per-call override
azldi.run('someMethod', [], { ignoreNonexecutable: true });

// Default for all calls
new Azldi({ ignoreNonexecutableByDefault: true });
```

### Behavior

- When a class doesn't have the called method:
  - `false` (default): **throws an error** (method is `undefined`, calling it crashes).
  - `true`: returns `ignoredResultSymbol` instead of calling the method.
- `ignoredResultSymbol` results are filtered out of the final return array.
- `onResult` callback is NOT called for ignored results.
- Per-call `ignoreNonexecutable` overrides the constructor-level `ignoreNonexecutableByDefault`.
- Explicitly passing `ignoreNonexecutable: false` re-enables strict mode even when default is `true`.

### Priority

```
per-call ignoreNonexecutable (if not null/undefined)
  > constructor ignoreNonexecutableByDefault
    > false (strict)
```

### Real-world Pattern

The plugin system always uses `ignoreNonexecutableByDefault: true` because plugins only implement relevant lifecycle hooks:

```typescript
const pluginIoc = new Azldi<PluginBase>({
  ignoreNonexecutableByDefault: true,
});
```

### Source

- [ClassInfo.ts](../src/library/ClassInfo.ts) `getRunFunction()`, `canBeIgnored()`
- [index.ts](../src/library/index.ts) `run()`, `runAsync()` — null-coalescing logic

---

## 14. shortCircuit — Early Termination

### API

```typescript
azldi.run('findHandler', [query], {
  shortCircuit: ({ result, classInfo }) => result != null,
});

await azldi.runAsync('findHandler', [query], {
  shortCircuit: ({ result }) => result != null,
});
```

### Behavior

- Predicate is checked after each class's method executes (after `onResult` fires).
- When predicate returns `true`:
  - `shortCircuitState.shortCircuited` flag is set to `true`.
  - No further top-level classes are processed (loop breaks).
  - Any class that hasn't started executing is skipped (including dependents of the triggering class).
  - **Semantic A**: If a dep triggers short-circuit, the parent class also does NOT run.
- Return value: array of results from classes that actually executed (via `resultsInfo`), excluding `ignoredResultSymbol`.
- Implicitly enables `resultsInfo` collection (same as `sortResultsByDeps`).
- For `runAsync`, execution becomes **sequential** (not parallel) to enable proper early termination.

### Source

- [index.ts](../src/library/index.ts) `_run()` — short-circuit branch
- [ComponentMetadata.ts](../src/library/ComponentMetadata.ts) `run()` — `shortCircuitState` check

---

## 15. Circular Dependency Detection

### Behavior

- During `_resolve()`, `depResolving` flag is set before resolving deps.
- If a dep resolution path circles back to the same class, `depResolving` is already `true`.
- Throws: `Error('Circular dependencies occured :<className>')`.

### Source

- [ComponentMetadata.ts](../src/library/ComponentMetadata.ts) `_resolve()`

---

## 16. ignoredResultSymbol — Internal Filtering

### Behavior

- A unique `Symbol('ignored-result')` used internally to mark non-executed methods.
- Produced by `ClassInfo.getRunFunction()` when `ignoreNonexecutable` is true and the method doesn't exist.
- Filtered out in `run()` and `runAsync()` before returning results.
- `ClassInfo.run()` does NOT call the callback for `ignoredResultSymbol` results.
- Exported from the library (available for external use if needed).

### Source

- [ClassInfo.ts](../src/library/ClassInfo.ts) `ignoredResultSymbol`, `getRunFunction()`, `run()`

---

## Appendix: Existing Test Coverage Gap Analysis

> **Note**: this gap analysis is a snapshot of an early state. The current test suite ([test/library/index.spec.ts](../test/library/index.spec.ts)) has 102 passing tests and covers most of the items previously listed as untested. The "NOT Tested" table below is preserved for historical reference and may not reflect current coverage.

### Currently Tested (in `test/library/index.spec.ts`)

| Feature | Covered |
|---------|---------|
| `register` (single) | Yes |
| `getClassInfo` | Yes |
| `digest` with `onCreate` | Yes |
| `digest` with `appendArgs` | Yes |
| `runAsync` basic | Yes |
| `runAsync` with `appendArgs` | Yes |
| `runAsync` with `onResultsInfoByDeps` + `sortResultsByDeps` | Yes |
| `ignoreNonexecutableByDefault: true` | Yes |
| `ignoreNonexecutable: false` override (throws) | Yes |
| **`runAsync` + `onResult` receives resolved value (not Promise)** (v1.1.1) | Yes |
| **`runAsync` + `onResult` transform-chain semantics** (v1.1.1) | Yes |
| **`runAsync` + `onResult` sequential ordering** (v1.1.1) | Yes |
| **`runAsync` + `shortCircuit` + `onResult` receives resolved value** (v1.1.1) | Yes |
| **`runAsync` + `onResultsInfoByDeps` receives resolved values** (v1.1.1) | Yes |
| **`runAsync` without `onResult` stays parallel** (v1.1.1) | Yes |
| **`runAsync` + `onResult` sibling deps fire in registration order (no race)** (v1.1.1) | Yes |
| **`runAsync` + `shortCircuit` + `onResult` + sibling deps deterministic** (v1.1.1) | Yes |

### NOT Tested

| Feature | Priority |
|---------|----------|
| `register` (array) | High |
| `run` (sync) — not tested at all | **Critical** |
| `run` with `onResult` callback | **Critical** |
| `run` with `sortResultsByDeps` | High |
| `get()` instance retrieval | High |
| `$funcDeps` — InjectedResult access to dep results | **Critical** |
| `$runBefore` — execution ordering | **Critical** |
| `$runBefore` + `$funcDeps` combined | High |
| `digest` with `sortResultsByDeps` | Medium |
| `digest` with `onResultsInfoByDeps` | Medium |
| `digest` with `args` | High |
| `InjectedResult.getDepsInfo()` | **Critical** |
| `InjectedResult.getResults()` | High |
| Circular dependency detection | High |
| `shortCircuit` (sync) | **Critical** |
| `shortCircuit` (async) | **Critical** |
| `shortCircuit` with deps (Semantic A) | **Critical** |
| `ignoreNonexecutable` per-call override to `true` | Medium |
| Methods without `$funcDeps` (no InjectedResult prepended) | High |
| `appendArgs` in `run`/`runAsync` | Medium |
| `onResultsInfoByDeps` in `run` (sync) | Medium |
| Registration order vs execution order | High |
| Duplicate `$name` registration behavior | Low |
| `getEmptyRunResultsInfo` helper | Low |
