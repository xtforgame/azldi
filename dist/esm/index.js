import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import _regeneratorRuntime from "@babel/runtime/regenerator";
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/* eslint-disable no-underscore-dangle */
import ClassInfo, { ignoredResultSymbol } from './ClassInfo';
import ComponentMetadata from './ComponentMetadata';
import InjectedResult from './InjectedResult';
export * from './InjectedResult';
export * from './ClassInfo';
export * from './ComponentMetadata';
export { ClassInfo, InjectedResult, ComponentMetadata };
var Azldi = /*#__PURE__*/function () {
  function Azldi() {
    var _this = this;
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, Azldi);
    _defineProperty(this, "getClassInfo", function (name) {
      return _this.classInfoMap[name];
    });
    this.classInfoMap = {};
    this.classInfoArray = [];
    this.options = options;
  }
  return _createClass(Azldi, [{
    key: "get",
    value: function get(name) {
      var classInfo = this.classInfoMap[name];
      return classInfo && classInfo.instance;
    }
  }, {
    key: "register",
    value: function register(Classes) {
      var _this2 = this;
      if (Array.isArray(Classes)) {
        return Classes.map(function (Class) {
          return _this2.register(Class);
        });
      }
      var classInfo = new ClassInfo(Classes);
      this.classInfoMap[classInfo.name] = classInfo;
      this.classInfoArray.push(classInfo);
      return true;
    }
  }, {
    key: "_run",
    value: function _run(functionName, args, appendArgs, callback) {
      var runSync = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
      var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
      var shortCircuit = options.shortCircuit,
        sequentialAsync = options.sequentialAsync;
      var metadataMap = {};
      var runBeforeMap = {};
      var metadataArray = [];
      this.classInfoArray.forEach(function (classInfo) {
        classInfo.getRunBeforeList(functionName).forEach(function (dep) {
          return runBeforeMap[dep] = [].concat(_toConsumableArray(runBeforeMap[dep] || []), [classInfo.name]);
        });
        var componentMetadata = new ComponentMetadata({
          classInfo: classInfo,
          metadataMap: metadataMap,
          runBeforeMap: runBeforeMap,
          functionName: functionName,
          appendArgs: appendArgs[classInfo.name]
        });
        metadataMap[componentMetadata.name] = componentMetadata;
        metadataArray.push(componentMetadata);
      });
      if (shortCircuit) {
        var shortCircuitState = {
          shortCircuited: false
        };
        var wrappedCallback = function wrappedCallback(arg) {
          callback(arg);
          if (!shortCircuitState.shortCircuited && shortCircuit(arg)) {
            shortCircuitState.shortCircuited = true;
          }
        };
        if (runSync) {
          var _cmOptions = {
            callback: wrappedCallback,
            runSync: runSync,
            ignoreNonexecutable: options.ignoreNonexecutable,
            shortCircuitState: shortCircuitState
          };
          var _results = [];
          var _iterator = _createForOfIteratorHelper(metadataArray),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var componentMetadata = _step.value;
              if (shortCircuitState.shortCircuited) break;
              var result = componentMetadata.getProcessFunc(_cmOptions).apply(void 0, _toConsumableArray(args));
              _results.push(result);
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
          return _results;
        }
        // Async: check predicate after await (resolved value), not in callback
        var cmOptions = {
          callback: callback,
          runSync: runSync,
          ignoreNonexecutable: options.ignoreNonexecutable,
          shortCircuitState: shortCircuitState,
          sequentialAsync: sequentialAsync
        };
        return _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
          var results, _iterator2, _step2, _componentMetadata, resolved;
          return _regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                results = [];
                _iterator2 = _createForOfIteratorHelper(metadataArray);
                _context.prev = 2;
                _iterator2.s();
              case 4:
                if ((_step2 = _iterator2.n()).done) {
                  _context.next = 15;
                  break;
                }
                _componentMetadata = _step2.value;
                if (!shortCircuitState.shortCircuited) {
                  _context.next = 8;
                  break;
                }
                return _context.abrupt("break", 15);
              case 8:
                _context.next = 10;
                return _componentMetadata.getProcessFunc(cmOptions).apply(void 0, _toConsumableArray(args));
              case 10:
                resolved = _context.sent;
                results.push(resolved);
                if (!shortCircuitState.shortCircuited && resolved !== ignoredResultSymbol && shortCircuit({
                  args: args,
                  result: resolved,
                  classInfo: _componentMetadata.classInfo
                })) {
                  shortCircuitState.shortCircuited = true;
                }
              case 13:
                _context.next = 4;
                break;
              case 15:
                _context.next = 20;
                break;
              case 17:
                _context.prev = 17;
                _context.t0 = _context["catch"](2);
                _iterator2.e(_context.t0);
              case 20:
                _context.prev = 20;
                _iterator2.f();
                return _context.finish(20);
              case 23:
                return _context.abrupt("return", results);
              case 24:
              case "end":
                return _context.stop();
            }
          }, _callee, null, [[2, 17, 20, 23]]);
        }))();
      }
      if (!runSync && sequentialAsync) {
        var _cmOptions2 = {
          callback: callback,
          runSync: runSync,
          ignoreNonexecutable: options.ignoreNonexecutable,
          sequentialAsync: sequentialAsync
        };
        return _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
          var results, _iterator3, _step3, _componentMetadata2, resolved;
          return _regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                results = [];
                _iterator3 = _createForOfIteratorHelper(metadataArray);
                _context2.prev = 2;
                _iterator3.s();
              case 4:
                if ((_step3 = _iterator3.n()).done) {
                  _context2.next = 12;
                  break;
                }
                _componentMetadata2 = _step3.value;
                _context2.next = 8;
                return _componentMetadata2.getProcessFunc(_cmOptions2).apply(void 0, _toConsumableArray(args));
              case 8:
                resolved = _context2.sent;
                results.push(resolved);
              case 10:
                _context2.next = 4;
                break;
              case 12:
                _context2.next = 17;
                break;
              case 14:
                _context2.prev = 14;
                _context2.t0 = _context2["catch"](2);
                _iterator3.e(_context2.t0);
              case 17:
                _context2.prev = 17;
                _iterator3.f();
                return _context2.finish(17);
              case 20:
                return _context2.abrupt("return", results);
              case 21:
              case "end":
                return _context2.stop();
            }
          }, _callee2, null, [[2, 14, 17, 20]]);
        }))();
      }
      var results = metadataArray.map(function (componentMetadata) {
        var result = componentMetadata.getProcessFunc({
          callback: callback,
          runSync: runSync,
          ignoreNonexecutable: options.ignoreNonexecutable
        }).apply(void 0, _toConsumableArray(args));
        return result;
      });
      return runSync ? results : Promise.all(results);
    }
  }, {
    key: "digest",
    value: function digest() {
      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref3$onCreate = _ref3.onCreate,
        onCreate = _ref3$onCreate === void 0 ? function () {} : _ref3$onCreate,
        _ref3$args = _ref3.args,
        args = _ref3$args === void 0 ? [] : _ref3$args,
        _ref3$appendArgs = _ref3.appendArgs,
        appendArgs = _ref3$appendArgs === void 0 ? {} : _ref3$appendArgs,
        onResultsInfoByDeps = _ref3.onResultsInfoByDeps,
        sortResultsByDeps = _ref3.sortResultsByDeps;
      var cb = onCreate;
      var resultsInfo = [];
      if (onResultsInfoByDeps || sortResultsByDeps) {
        cb = function cb(args) {
          resultsInfo.push(args);
          onCreate(args);
        };
      }
      var results = this._run(undefined, args, appendArgs, cb, true);
      if (onResultsInfoByDeps) {
        onResultsInfoByDeps(resultsInfo);
      }
      if (sortResultsByDeps) {
        return resultsInfo.map(function (ri) {
          return ri.result;
        });
      }
      return results;
    }
  }, {
    key: "getEmptyRunResultsInfo",
    value: function getEmptyRunResultsInfo() {
      return [];
    }
  }, {
    key: "run",
    value: function run(functionName) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var _ref4 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        _ref4$onResult = _ref4.onResult,
        onResult = _ref4$onResult === void 0 ? function () {} : _ref4$onResult,
        _ref4$appendArgs = _ref4.appendArgs,
        appendArgs = _ref4$appendArgs === void 0 ? {} : _ref4$appendArgs,
        onResultsInfoByDeps = _ref4.onResultsInfoByDeps,
        sortResultsByDeps = _ref4.sortResultsByDeps,
        ignoreNonexecutable = _ref4.ignoreNonexecutable,
        shortCircuit = _ref4.shortCircuit;
      var cb = onResult;
      var resultsInfo = [];
      if (onResultsInfoByDeps || sortResultsByDeps || shortCircuit) {
        cb = function cb(args) {
          resultsInfo.push(args);
          onResult(args);
        };
      }
      var result = this._run(functionName, args, appendArgs, cb, true, {
        ignoreNonexecutable: ignoreNonexecutable == null ? this.options.ignoreNonexecutableByDefault : ignoreNonexecutable,
        shortCircuit: shortCircuit
      });
      if (onResultsInfoByDeps) {
        onResultsInfoByDeps(resultsInfo);
      }
      if (sortResultsByDeps || shortCircuit) {
        return resultsInfo.map(function (ri) {
          return ri.result;
        });
      }
      return result.filter(function (r) {
        return r !== ignoredResultSymbol;
      });
    }
  }, {
    key: "runAsync",
    value: function runAsync(functionName) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var userProvidedOnResult = options.onResult != null;
      var _options$onResult = options.onResult,
        onResult = _options$onResult === void 0 ? function () {} : _options$onResult,
        _options$appendArgs = options.appendArgs,
        appendArgs = _options$appendArgs === void 0 ? {} : _options$appendArgs,
        onResultsInfoByDeps = options.onResultsInfoByDeps,
        sortResultsByDeps = options.sortResultsByDeps,
        ignoreNonexecutable = options.ignoreNonexecutable,
        shortCircuit = options.shortCircuit;
      var cb = onResult;
      var resultsInfo = [];
      if (onResultsInfoByDeps || sortResultsByDeps || shortCircuit) {
        cb = function cb(args) {
          resultsInfo.push(args);
          onResult(args);
        };
      }
      return this._run(functionName, args, appendArgs, cb, false, {
        ignoreNonexecutable: ignoreNonexecutable == null ? this.options.ignoreNonexecutableByDefault : ignoreNonexecutable,
        shortCircuit: shortCircuit,
        sequentialAsync: userProvidedOnResult
      }).then(function (result) {
        if (onResultsInfoByDeps) {
          onResultsInfoByDeps(resultsInfo);
        }
        if (shortCircuit) {
          return result.filter(function (r) {
            return r !== ignoredResultSymbol;
          });
        }
        if (sortResultsByDeps) {
          return Promise.all(resultsInfo.map(function (ri) {
            return ri.result;
          }));
        }
        return result.filter(function (r) {
          return r !== ignoredResultSymbol;
        });
      });
    }
  }]);
}();
export { Azldi as default };