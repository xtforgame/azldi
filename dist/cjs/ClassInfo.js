"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ignoredResultSymbol = exports["default"] = exports.canBeIgnored = void 0;
var _construct2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/construct"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/toConsumableArray"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/createClass"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/classCallCheck"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/defineProperty"));
var ignoredResultSymbol = exports.ignoredResultSymbol = Symbol('ignored-result');
var canBeIgnored = exports.canBeIgnored = function canBeIgnored(ignoreNonexecutable) {
  return ignoreNonexecutable == null ? false : ignoreNonexecutable;
};
var ClassInfo = exports["default"] = /*#__PURE__*/(0, _createClass2["default"])(function ClassInfo(Class) {
  var _this = this;
  (0, _classCallCheck2["default"])(this, ClassInfo);
  (0, _defineProperty2["default"])(this, "getRunBeforeList", function (functionName) {
    return _this.runBefore[functionName] || [];
  });
  (0, _defineProperty2["default"])(this, "getDependencies", function (functionName) {
    if (functionName) {
      return _this.funcDeps[functionName] || [];
    }
    return _this.Class.$inject || [];
  });
  (0, _defineProperty2["default"])(this, "getRunFunction", function (functionName) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (_this.instance && functionName) {
      if (!_this.instance[functionName] && canBeIgnored(options.ignoreNonexecutable)) {
        return function () {
          return ignoredResultSymbol;
        };
      }
      return function () {
        var _ref;
        return (_ref = _this.instance)[functionName].apply(_ref, arguments);
      };
    }
    return function (injectedResult) {
      if (!_this.instance) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        _this.instance = (0, _construct2["default"])(_this.Class, (0, _toConsumableArray2["default"])(injectedResult.getResults()).concat(args));
      }
      return _this.instance;
    };
  });
  (0, _defineProperty2["default"])(this, "run", function (functionName, args, callback) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var func = _this.getRunFunction(functionName, options);
    var result = func.apply(void 0, (0, _toConsumableArray2["default"])(args));
    if (result !== ignoredResultSymbol) {
      callback({
        args: args,
        result: result,
        classInfo: _this
      });
    }
    return result;
  });
  this.Class = Class;
  this.name = this.Class.$name;
  this.instance = undefined;
  this.funcDeps = this.Class.$funcDeps || {};
  this.runBefore = this.Class.$runBefore || {};
});