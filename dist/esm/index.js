import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
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
        return r !== ignoredResultSymbol;
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
          return r !== ignoredResultSymbol;
        });
      });
    }
  }]);
}();
export { Azldi as default };