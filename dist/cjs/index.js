"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  ClassInfo: true,
  ComponentMetadata: true,
  InjectedResult: true
};
Object.defineProperty(exports, "ClassInfo", {
  enumerable: true,
  get: function get() {
    return _ClassInfo["default"];
  }
});
Object.defineProperty(exports, "ComponentMetadata", {
  enumerable: true,
  get: function get() {
    return _ComponentMetadata["default"];
  }
});
Object.defineProperty(exports, "InjectedResult", {
  enumerable: true,
  get: function get() {
    return _InjectedResult["default"];
  }
});
exports["default"] = void 0;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/toConsumableArray"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/createClass"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/defineProperty"));
var _ClassInfo = _interopRequireWildcard(require("./ClassInfo"));
Object.keys(_ClassInfo).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ClassInfo[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _ClassInfo[key];
    }
  });
});
var _ComponentMetadata = _interopRequireWildcard(require("./ComponentMetadata"));
Object.keys(_ComponentMetadata).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ComponentMetadata[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _ComponentMetadata[key];
    }
  });
});
var _InjectedResult = _interopRequireWildcard(require("./InjectedResult"));
Object.keys(_InjectedResult).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _InjectedResult[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _InjectedResult[key];
    }
  });
});
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
/* eslint-disable no-underscore-dangle */
var Azldi = exports["default"] = /*#__PURE__*/function () {
  function Azldi() {
    var _this = this;
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2["default"])(this, Azldi);
    (0, _defineProperty2["default"])(this, "getClassInfo", function (name) {
      return _this.classInfoMap[name];
    });
    this.classInfoMap = {};
    this.classInfoArray = [];
    this.options = options;
  }
  return (0, _createClass2["default"])(Azldi, [{
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
      var classInfo = new _ClassInfo["default"](Classes);
      this.classInfoMap[classInfo.name] = classInfo;
      this.classInfoArray.push(classInfo);
      return true;
    }
  }, {
    key: "_run",
    value: function _run(functionName, args, appendArgs, callback) {
      var runSync = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
      var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
      var metadataMap = {};
      var runBeforeMap = {};
      var metadataArray = [];
      this.classInfoArray.forEach(function (classInfo) {
        classInfo.getRunBeforeList(functionName).forEach(function (dep) {
          return runBeforeMap[dep] = [].concat((0, _toConsumableArray2["default"])(runBeforeMap[dep] || []), [classInfo.name]);
        });
        var componentMetadata = new _ComponentMetadata["default"]({
          classInfo: classInfo,
          metadataMap: metadataMap,
          runBeforeMap: runBeforeMap,
          functionName: functionName,
          appendArgs: appendArgs[classInfo.name]
        });
        metadataMap[componentMetadata.name] = componentMetadata;
        metadataArray.push(componentMetadata);
      });
      var results = metadataArray.map(function (componentMetadata) {
        var result = componentMetadata.getProcessFunc({
          callback: callback,
          runSync: runSync,
          ignoreNonexecutable: options.ignoreNonexecutable
        }).apply(void 0, (0, _toConsumableArray2["default"])(args));
        return result;
      });
      return runSync ? results : Promise.all(results);
    }
  }, {
    key: "digest",
    value: function digest() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$onCreate = _ref.onCreate,
        onCreate = _ref$onCreate === void 0 ? function () {} : _ref$onCreate,
        _ref$args = _ref.args,
        args = _ref$args === void 0 ? [] : _ref$args,
        _ref$appendArgs = _ref.appendArgs,
        appendArgs = _ref$appendArgs === void 0 ? {} : _ref$appendArgs,
        onResultsInfoByDeps = _ref.onResultsInfoByDeps,
        sortResultsByDeps = _ref.sortResultsByDeps;
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
      var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        _ref2$onResult = _ref2.onResult,
        onResult = _ref2$onResult === void 0 ? function () {} : _ref2$onResult,
        _ref2$appendArgs = _ref2.appendArgs,
        appendArgs = _ref2$appendArgs === void 0 ? {} : _ref2$appendArgs,
        onResultsInfoByDeps = _ref2.onResultsInfoByDeps,
        sortResultsByDeps = _ref2.sortResultsByDeps,
        ignoreNonexecutable = _ref2.ignoreNonexecutable;
      var cb = onResult;
      var resultsInfo = [];
      if (onResultsInfoByDeps || sortResultsByDeps) {
        cb = function cb(args) {
          resultsInfo.push(args);
          onResult(args);
        };
      }
      var result = this._run(functionName, args, appendArgs, cb, true, {
        ignoreNonexecutable: ignoreNonexecutable == null ? this.options.ignoreNonexecutableByDefault : ignoreNonexecutable
      });
      if (onResultsInfoByDeps) {
        onResultsInfoByDeps(resultsInfo);
      }
      if (sortResultsByDeps) {
        return resultsInfo.map(function (ri) {
          return ri.result;
        });
      }
      return result.filter(function (r) {
        return r !== _ClassInfo.ignoredResultSymbol;
      });
    }
  }, {
    key: "runAsync",
    value: function runAsync(functionName) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        _ref3$onResult = _ref3.onResult,
        onResult = _ref3$onResult === void 0 ? function () {} : _ref3$onResult,
        _ref3$appendArgs = _ref3.appendArgs,
        appendArgs = _ref3$appendArgs === void 0 ? {} : _ref3$appendArgs,
        onResultsInfoByDeps = _ref3.onResultsInfoByDeps,
        sortResultsByDeps = _ref3.sortResultsByDeps,
        ignoreNonexecutable = _ref3.ignoreNonexecutable;
      var cb = onResult;
      var resultsInfo = [];
      if (onResultsInfoByDeps || sortResultsByDeps) {
        cb = function cb(args) {
          resultsInfo.push(args);
          onResult(args);
        };
      }
      return this._run(functionName, args, appendArgs, cb, false, {
        ignoreNonexecutable: ignoreNonexecutable == null ? this.options.ignoreNonexecutableByDefault : ignoreNonexecutable
      }).then(function (result) {
        if (onResultsInfoByDeps) {
          onResultsInfoByDeps(resultsInfo);
        }
        if (sortResultsByDeps) {
          return Promise.all(resultsInfo.map(function (ri) {
            return ri.result;
          }));
        }
        return result.filter(function (r) {
          return r !== _ClassInfo.ignoredResultSymbol;
        });
      });
    }
  }]);
}();