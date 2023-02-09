"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Azldi = function () {
  function Azldi() {
    var _this = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Azldi);

    _defineProperty(this, "classInfoMap", void 0);

    _defineProperty(this, "classInfoArray", void 0);

    _defineProperty(this, "options", void 0);

    _defineProperty(this, "getClassInfo", function (name) {
      return _this.classInfoMap[name];
    });

    this.classInfoMap = {};
    this.classInfoArray = [];
    this.options = options;
  }

  _createClass(Azldi, [{
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
          return runBeforeMap[dep] = [].concat(_toConsumableArray(runBeforeMap[dep] || []), [classInfo.name]);
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
          return resultsInfo.map(function (ri) {
            return ri.result;
          });
        }

        return result.filter(function (r) {
          return r !== _ClassInfo.ignoredResultSymbol;
        });
      });
    }
  }]);

  return Azldi;
}();

exports["default"] = Azldi;