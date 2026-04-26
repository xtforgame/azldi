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
import InjectedResult from './InjectedResult';
import { ignoredResultSymbol } from './ClassInfo';
var ComponentMetadata = /*#__PURE__*/function () {
  function ComponentMetadata(_ref) {
    var _this = this;
    var classInfo = _ref.classInfo,
      metadataMap = _ref.metadataMap,
      runBeforeMap = _ref.runBeforeMap,
      _functionName = _ref.functionName,
      _ref$appendArgs = _ref.appendArgs,
      appendArgs = _ref$appendArgs === void 0 ? [] : _ref$appendArgs;
    _classCallCheck(this, ComponentMetadata);
    _defineProperty(this, "run", function (functionName, args, callback) {
      var _options$shortCircuit;
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      if (_this.isDone) {
        return _this.result;
      }
      if ((_options$shortCircuit = options.shortCircuitState) !== null && _options$shortCircuit !== void 0 && _options$shortCircuit.shortCircuited) {
        return ignoredResultSymbol;
      }
      _this.result = _this.classInfo.run(functionName, [].concat(_toConsumableArray(args), _toConsumableArray(_this.appendArgs)), callback, {
        ignoreNonexecutable: options.ignoreNonexecutable,
        runSync: options.runSync
      });
      _this.isDone = true;
      return _this.result;
    });
    _defineProperty(this, "getProcessFunc", function () {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (_this.processFunc) {
        return _this.processFunc;
      }
      var callback = options.callback || function () {};
      var runSync = options.runSync !== null ? options.runSync : true;
      _this._resolve(options);
      var injectedResult = new InjectedResult(_this.metadataMap, _this.depComponentNames);
      if (runSync) {
        _this.processFunc = function () {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          return _this.run(_this.functionName, injectedResult.inject(_this.depRunFuncs.map(function (depRunFunc) {
            return depRunFunc.apply(void 0, args);
          }), args), callback, options);
        };
      } else if (options.sequentialAsync) {
        _this.processFunc = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
          var results,
            _len2,
            args,
            _key2,
            _iterator,
            _step,
            depRunFunc,
            _args = arguments;
          return _regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                results = [];
                for (_len2 = _args.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                  args[_key2] = _args[_key2];
                }
                _iterator = _createForOfIteratorHelper(_this.depRunFuncs);
                _context.prev = 3;
                _iterator.s();
              case 5:
                if ((_step = _iterator.n()).done) {
                  _context.next = 14;
                  break;
                }
                depRunFunc = _step.value;
                _context.t0 = results;
                _context.next = 10;
                return depRunFunc.apply(void 0, args);
              case 10:
                _context.t1 = _context.sent;
                _context.t0.push.call(_context.t0, _context.t1);
              case 12:
                _context.next = 5;
                break;
              case 14:
                _context.next = 19;
                break;
              case 16:
                _context.prev = 16;
                _context.t2 = _context["catch"](3);
                _iterator.e(_context.t2);
              case 19:
                _context.prev = 19;
                _iterator.f();
                return _context.finish(19);
              case 22:
                return _context.abrupt("return", _this.run(_this.functionName, injectedResult.inject(results, args), callback, options));
              case 23:
              case "end":
                return _context.stop();
            }
          }, _callee, null, [[3, 16, 19, 22]]);
        }));
      } else {
        _this.processFunc = function () {
          for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
          }
          return Promise.all(_this.depRunFuncs.map(function (depRunFunc) {
            return depRunFunc.apply(void 0, args);
          })).then(function (results) {
            return _this.run(_this.functionName, injectedResult.inject(results, args), callback, options);
          });
        };
      }
      return _this.processFunc;
    });
    this.classInfo = classInfo;
    this.metadataMap = metadataMap;
    this.runBeforeList = runBeforeMap[this.name] || [];
    this.functionName = this.classInfo.instance && _functionName;
    this.appendArgs = appendArgs;
    this.depComponentNames = [];
    this.depRunFuncs = [];
    this.depResolving = false;
    this.processFunc = null;
    this.isDone = false;
    this.result = null;
  }
  return _createClass(ComponentMetadata, [{
    key: "resetState",
    value: function resetState() {
      this.depResolving = false;
      this.processFunc = null;
      this.isDone = false;
      this.result = null;
    }
  }, {
    key: "name",
    get: function get() {
      return this.classInfo.name;
    }
  }, {
    key: "_resolve",
    value: function _resolve(options) {
      var _this2 = this;
      if (this.depResolving) {
        throw new Error("Circular dependencies occured :".concat(this.name));
      }
      this.depResolving = true;
      this.depComponentNames = this.classInfo.getDependencies(this.functionName);
      this.depRunFuncs = [].concat(_toConsumableArray(this.depComponentNames), _toConsumableArray(this.runBeforeList)).map(function (dep) {
        var depComponentMetadata = _this2.metadataMap[dep];
        if (!depComponentMetadata) {
          throw new Error("Component not Found :".concat(dep));
        }
        return depComponentMetadata.getProcessFunc(options);
      });
      this.depResolving = false;
    }
  }]);
}();
export { ComponentMetadata as default };