# AZLDI Bug: `runAsync` 的 `onResult` callback 收到 Promise 而非 resolved value

> azldi v1.0.11 → 已於 v1.1.1 修復

## 0. 修復狀態

✅ **已修復** (2026-04-26)

### 變更摘要

| 檔案 | 變更 |
|------|------|
| [src/ClassInfo.ts](../src/ClassInfo.ts) | `run` 在 `runSync === false` 且回傳值是 thenable 時，把 callback 推遲到 `.then(resolved => ...)` 內呼叫，並回傳串接的 Promise |
| [src/ClassInfo.ts](../src/ClassInfo.ts) | `ClassInfoRunOptions` 新增 `runSync?: boolean` 欄位 |
| [src/ComponentMetadata.ts](../src/ComponentMetadata.ts) | `run` 把 `options.runSync` 透傳給 `classInfo.run` |
| [src/ComponentMetadata.ts](../src/ComponentMetadata.ts) | `ComponentMetadataRunOptions` 新增 `sequentialAsync?: boolean`；`getProcessFunc` async 分支在此 flag 為 true 時改用 `for...of + await` 跑 deps，避免 sibling deps race |
| [src/index.ts](../src/index.ts) | `RunCoreOptions` 新增 `sequentialAsync?: boolean` |
| [src/index.ts](../src/index.ts) | `_run` 在 `!runSync && sequentialAsync` (且非 `shortCircuit`) 時改走 `for...of + await` 的 sequential top-level loop |
| [src/index.ts](../src/index.ts) | `_run` 把 `sequentialAsync` 透傳到所有 async 路徑的 `cmOptions`（包含 shortCircuit 的 async branch） |
| [src/index.ts](../src/index.ts) | `runAsync` 偵測 `options.onResult != null`（在套用預設值前），設 `sequentialAsync: userProvidedOnResult` |

### 採用的方案

採用原文 §5 的**方案 A** + ClassInfo.run 內部 await。最終結合：

1. **ClassInfo.run 同步偵測 thenable**：對 async function 回傳值做 `.then(...)` chain，把 callback 推遲到 resolved 之後。這樣 `onResult` / `resultsInfo.push` / `onResultsInfoByDeps` 全部都拿到 resolved value。
2. **`_run` 在有 `onResult` 時切 sequential（top-level）**：保證 transform chain 語義（前一個 plugin 的 `onResult` 完成後，後一個 plugin 才開始 body 執行）。
3. **`ComponentMetadata` 在有 `onResult` 時切 sequential（dep 內部）**：避免 sibling deps（同一個 method 的多個 `$funcDeps` / `$runBefore`）透過 `Promise.all` 平行造成 onResult 順序競爭。

無 `onResult`、無 `shortCircuit` 時仍維持 parallel（向後相容、效能）。`shortCircuit` 沒搭 `onResult` 時 top-level 仍是 sequential，但 dep 內部維持 parallel；搭配 `onResult` 時兩層都 sequential。

### 行為矩陣

| 情境 | 修復前 | 修復後 |
|------|--------|--------|
| `runAsync` + `onResult` + async method | `result = Promise<T>` | `result = T` |
| `runAsync` + `onResult` + transform chain (getter) | parallel，後者讀 stale 值 | sequential，後者讀 transformed 值 |
| `runAsync` + `onResult` + 多個 sibling deps | sibling 透過 `Promise.all` 平行，onResult 順序非 deterministic | dep 內部也 sequential，onResult 按 registration order 觸發 |
| `runAsync` + `onResultsInfoByDeps` + async method | `info[i].result = Promise<T>` | `info[i].result = T` |
| `runAsync` + `shortCircuit` + `onResult` | onResult 收 Promise；sibling deps 仍 race | onResult 收 resolved value；sibling deps sequential |
| `runAsync` 無 `onResult`/`shortCircuit` | parallel | parallel（不變） |
| `run` (sync) | 不變 | 不變 |
| `digest` + `onCreate` | 不變（sync） | 不變 |

### 觸發條件總表

| 條件 | top-level 行為 | dep 內部行為 |
|------|----------------|--------------|
| 無 `onResult` 無 `shortCircuit` | parallel | parallel |
| 有 `onResult` 無 `shortCircuit` | **sequential** | **sequential** |
| 無 `onResult` 有 `shortCircuit` | sequential（既有） | parallel |
| 有 `onResult` 有 `shortCircuit` | sequential | **sequential** |

口訣：**`onResult` 觸發兩層 sequential；`shortCircuit` 只觸發 top-level sequential。**

### 新增測試

[test/library/index.spec.ts](../test/library/index.spec.ts) `9. onResult / onCreate Callbacks > onResult (runAsync)` 內新增：

- ✓ receives resolved value (not a Promise) for async methods
- ✓ transform chain: getter+onResult sees resolved values across plugins
- ✓ runs sequentially when onResult is provided (later plugin sees earlier resolved state)
- ✓ shortCircuit + onResult: onResult also receives resolved value
- ✓ without onResult: parallel execution still works
- ✓ onResultsInfoByDeps receives resolved values (not Promises) for async methods
- ✓ sibling deps: onResult fires in registration order even when slow dep is registered first
- ✓ sibling deps + shortCircuit + onResult: siblings fire in deterministic order

---

> 以下為原始 bug 分析文件，保留作為設計脈絡。

## 1. 問題摘要

`runAsync` 搭配 `onResult` 使用時，如果 plugin method 是 async function（回傳 Promise），`onResult` callback 收到的 `result` 是**未 resolve 的 Promise 物件**，而非實際的回傳值。

這導致仰賴 `onResult` 做 transform chain（getter + onResult pattern）的消費端無法正確運作：前一個 plugin 的 `onResult` 把 `value` 設成 Promise，後一個 plugin 透過 getter 讀到的是 Promise 物件而非資料。

## 2. 重現步驟

### 最小重現

```typescript
import Azldi from 'azldi';

class PluginA {
  static $name = 'pluginA';
  static $inject = [];
  async transform(getVal: () => number) {
    const val = getVal();
    return val + 10;  // 回傳 Promise<number>
  }
}

class PluginB {
  static $name = 'pluginB';
  static $inject = [];
  async transform(getVal: () => number) {
    const val = getVal();
    return val + 20;  // 預期 val 是 number，實際收到 Promise
  }
}

const azldi = new Azldi({ ignoreNonexecutableByDefault: true });
azldi.register([PluginA, PluginB]);
azldi.digest();

let value = 100;
const getValue = () => value;
await azldi.runAsync('transform', [getValue], {
  onResult: ({ result }) => {
    if (result != null) value = result;  // result 是 Promise，不是 110
  },
});

// 預期 value = 130（100 + 10 + 20）
// 實際 value = NaN 或 TypeError
//   因為 PluginA 的 onResult 把 value 設成 Promise<110>
//   PluginB 讀到 Promise 物件，Promise + 20 = NaN
```

### 在 Ryko 中的實際錯誤

```
TypeError: toolSet.tools is not iterable
    at DebugToolsRykoPlugin.onPrepareTools (DebugToolsRykoPlugin.ts:95)
```

`ClientInfoRykoPlugin.onPrepareTools` 回傳 `Promise<ToolSet>`，`onResult` 把 `value` 設成這個 Promise，`DebugToolsRykoPlugin` 用 getter 讀到 Promise，對 `Promise.tools` 做展開就炸了。

## 3. 根因

### 影響路徑：非 shortCircuit 的 parallel path

**`ClassInfo.run`**（[src/ClassInfo.ts:67-78](node_modules/azldi/src/ClassInfo.ts#L67-L78)）：

```typescript
run = (functionName, args, callback, options) => {
  const func = this.getRunFunction(functionName, options);
  const result = func(...args);   // async function → 回傳 Promise
  if (result !== ignoredResultSymbol) {
    callback({ result });          // ← callback 同步呼叫，收到 Promise 物件
  }
  return result;
};
```

`callback`（也就是 `onResult`）是**同步呼叫**的。對 sync function 沒問題；對 async function，`func(...args)` 回傳的是 Promise，`callback` 收到的就是 Promise。

### 為什麼 parallel path 受影響

`_run` 在沒有 `shortCircuit` 時走 parallel path（[src/index.ts:159-168](node_modules/azldi/src/index.ts#L159-L168)）：

```typescript
const results = metadataArray.map((cm) => {
  const result = cm.getProcessFunc({ callback, runSync: false })(...args);
  return result;
});
return Promise.all(results);
```

每個 plugin 的 `getProcessFunc`（async 版，[src/ComponentMetadata.ts:137-143](node_modules/azldi/src/ComponentMetadata.ts#L137-L143)）：

```typescript
this.processFunc = (...args) =>
  Promise.all(this.depRunFuncs.map(f => f(...args)))
    .then(results => this.run(functionName, inject(results, args), callback, options));
```

`this.run()` 內部呼叫 `classInfo.run()`，而 `classInfo.run()` 在取得 `func(...args)` 的原始回傳值（Promise）後**立即同步呼叫 callback**。

`.then()` 的回傳值會被 Promise 自動解包（thenable resolution），所以外層 `Promise.all` 最終 resolve 到正確的值。但 `callback` 早已在 resolve 前就觸發了。

### 為什麼 shortCircuit path 沒這個問題（部分）

shortCircuit path（[src/index.ts:144-156](node_modules/azldi/src/index.ts#L144-L156)）用 `for...of` + `await` 逐一執行：

```typescript
const resolved = await cm.getProcessFunc(cmOptions)(...args);
// resolved 是 await 後的值
shortCircuit({ result: resolved });  // ← 拿到正確的 resolved value
```

但注意：即使在 shortCircuit path，**`callback`（onResult）仍然在 `classInfo.run` 內部同步觸發，收到的仍是 Promise**。只有 shortCircuit callback 本身收到 resolved value（因為它是在 `await` 之後才呼叫的）。

### 執行時序圖

```
                     parallel path (無 shortCircuit)
                     ================================

metadataArray.map() 同步啟動所有 plugin：

  PluginA.processFunc(...args)
    → Promise.all(deps).then(() => classInfo.run(...))
    → classInfo.run 內部：
        result = pluginA.transform(getValue)  → Promise<110>
        callback({ result: Promise<110> })     ← onResult 收到 Promise！
        return Promise<110>
    → .then() 自動解包 → 外層 Promise resolve 到 110

  PluginB.processFunc(...args)          ← 同步啟動，不等 PluginA
    → Promise.all(deps).then(() => classInfo.run(...))
    → classInfo.run 內部：
        result = pluginB.transform(getValue)
        // getValue() 回傳 value，此時 value = Promise<110>（被 onResult 設過）
        // PluginB 拿到 Promise 物件 → 無法正確操作 → 錯誤
```

## 4. 預期行為

**`runAsync` 的 `onResult` callback 收到的 `result` 應該是 await 後的實際值，而非 Promise。**

| 情境 | 現在行為 | 預期行為 |
|------|---------|---------|
| `runAsync` + `onResult` + plugin 回傳 `Promise<T>` | `onResult({ result: Promise<T> })` | `onResult({ result: T })` |
| `runAsync` + `onResult` + plugin 回傳 sync value `T` | `onResult({ result: T })` | 不變 |
| `run`（sync）+ `onResult` | `onResult({ result: T })` | 不變 |
| `runAsync` 的回傳值 `Promise<T[]>` | resolve 到 `T[]`（正確） | 不變 |

### 附帶語義：sequential 執行

當 `runAsync` 搭配 `onResult` 時，執行順序必須是 **sequential**（等 PluginA 完成並觸發 onResult 後，才開始 PluginB）。原因：`onResult` 的典型用途是 transform chain——前一個 plugin 的結果要先更新 shared value，後一個 plugin 才能讀到正確的值。

如果維持 parallel 執行，即使 `onResult` 拿到 resolved value，各 plugin 讀 getter 的時機仍不可控，transform chain 語義就不成立。

> 注意：無 `onResult` 時保持 parallel 是合理的（各 plugin 獨立運行，不需要看到彼此的結果）。是否只在有 `onResult` 時切換為 sequential，或是統一改為 sequential，由實作者決定。

## 5. 建議修改點

### 方案 A：修改 `_run` 的 parallel path（最小改動）

當 `runAsync` 傳了 `onResult` 且不是 shortCircuit 時，改用 sequential loop + await，並在 await 之後才呼叫 `callback`。

**修改位置**：`src/index.ts` `_run` method，lines 159-168

概念虛擬碼：

```typescript
// 目前（parallel）：
const results = metadataArray.map(cm => cm.getProcessFunc(opts)(...args));
return Promise.all(results);

// 改為（sequential，有 onResult 時）：
const results = [];
for (const cm of metadataArray) {
  const resolved = await cm.getProcessFunc(opts_without_callback)(...args);
  if (resolved !== ignoredResultSymbol) {
    callback({ args, result: resolved, classInfo: cm.classInfo });
  }
  results.push(resolved);
}
return results;
```

要點：
- `getProcessFunc` 不帶 `callback`（避免 `classInfo.run` 內部的同步 callback）
- 改在 `await` 之後手動呼叫 `callback`，確保 `result` 是 resolved value
- 沒傳 `onResult` 時可以保持原有 parallel path（向後相容、效能較好）

### 方案 B：修改 `ClassInfo.run` 本身

讓 `ClassInfo.run` 偵測回傳值是 thenable 時，await 後再呼叫 callback。

但這會改動更底層，影響範圍更大（`ComponentMetadata.run` 也會受影響），且 `ClassInfo.run` 的簽名目前是同步的，改成 async 會是 breaking change。**不建議。**

## 6. 向後相容性

### 需要確保不被影響的行為

- `run`（sync）的所有行為不變
- `runAsync` 無 `onResult` 時的 parallel 行為不變
- `runAsync` + `shortCircuit` 的 sequential 行為不變
- `digest` + `onCreate` 不受影響（sync path）
- `onResultsInfoByDeps` 行為不變
- `sortResultsByDeps` 行為不變

### 需要驗證的影響

在本專案中，`runAsync` + `onResult` 的使用位置（[RykoPluginMgr.ts](src/server/plugins/RykoPlugin/hooks/RykoPluginMgr.ts)）：

| Method | Hook | Pattern |
|--------|------|---------|
| `runPrepareUserMessage` | Hook 3 | getter + onResult transform chain |
| `runPrepareSystemPrompt` | Hook 4 | getter + onResult transform chain |
| `runPrepareTools` | Hook 5 | getter + onResult transform chain |
| `runLlmResponse` | Hook 7 | onResult 收集結果陣列 |

修復後這四個都會受益。其中 Hook 5 是目前唯一會 crash 的（因為有兩個 plugin 同時回傳非 null）。

## 7. 測試要求

### 新增測試案例

現有 `onResult (runAsync)` 測試（test/library/index.spec.ts:515-528）只驗證 `classInfo.name` 順序，不驗證 `result` 的值。需要補充：

1. **`onResult` 收到 resolved value（非 Promise）**
   ```typescript
   // PluginA.doWorkAsync() 回傳 Promise.resolve('resultA')
   // onResult 應收到 'resultA'，不是 Promise<'resultA'>
   ```

2. **Transform chain 語義正確**
   ```typescript
   // PluginA 讀 getValue() 取得 100，回傳 110
   // onResult 設 value = 110
   // PluginB 讀 getValue() 取得 110（不是 Promise），回傳 130
   // 最終 value = 130
   ```

3. **Sequential 執行順序**
   ```typescript
   // PluginA 有 delay（setTimeout 50ms），PluginB 讀 getter
   // PluginB 的 getter 必須讀到 PluginA 的 resolved 結果（而非初始值）
   ```

4. **無 onResult 時維持 parallel（若選擇只在有 onResult 時 sequential）**

5. **shortCircuit + onResult 也收到 resolved value**
   - 目前 shortCircuit path 的 `callback` 仍在 `classInfo.run` 內同步觸發，一樣收到 Promise

### 既有測試不得 break

```bash
cd node_modules/azldi && npm test
```
