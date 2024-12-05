"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _InjectedResult = _interopRequireDefault(require("./InjectedResult"));
/* eslint-disable no-underscore-dangle */
var ComponentMetadata = exports["default"] = /*#__PURE__*/function () {
  function ComponentMetadata(_ref) {
    var _this = this;
    var classInfo = _ref.classInfo,
      metadataMap = _ref.metadataMap,
      runBeforeMap = _ref.runBeforeMap,
      _functionName = _ref.functionName,
      _ref$appendArgs = _ref.appendArgs,
      appendArgs = _ref$appendArgs === void 0 ? [] : _ref$appendArgs;
    (0, _classCallCheck2["default"])(this, ComponentMetadata);
    (0, _defineProperty2["default"])(this, "run", function (functionName, args, callback) {
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      if (_this.isDone) {
        return _this.result;
      }
      _this.result = _this.classInfo.run(functionName, [].concat((0, _toConsumableArray2["default"])(args), (0, _toConsumableArray2["default"])(_this.appendArgs)), callback, {
        ignoreNonexecutable: options.ignoreNonexecutable
      });
      _this.isDone = true;
      return _this.result;
    });
    (0, _defineProperty2["default"])(this, "getProcessFunc", function () {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (_this.processFunc) {
        return _this.processFunc;
      }
      var callback = options.callback || function () {};
      var runSync = options.runSync !== null ? options.runSync : true;
      _this._resolve(options);
      var injectedResult = new _InjectedResult["default"](_this.metadataMap, _this.depComponentNames);
      if (runSync) {
        _this.processFunc = function () {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          return _this.run(_this.functionName, injectedResult.inject(_this.depRunFuncs.map(function (depRunFunc) {
            return depRunFunc.apply(void 0, args);
          }), args), callback, options);
        };
      } else {
        _this.processFunc = function () {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
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
  return (0, _createClass2["default"])(ComponentMetadata, [{
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
      this.depRunFuncs = [].concat((0, _toConsumableArray2["default"])(this.depComponentNames), (0, _toConsumableArray2["default"])(this.runBeforeList)).map(function (dep) {
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