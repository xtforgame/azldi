import _construct from "@babel/runtime/helpers/esm/construct";
import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
export var ignoredResultSymbol = Symbol('ignored-result');
export var canBeIgnored = function canBeIgnored(ignoreNonexecutable) {
  return ignoreNonexecutable == null ? false : ignoreNonexecutable;
};
var ClassInfo = /*#__PURE__*/_createClass(function ClassInfo(Class) {
  var _this = this;
  _classCallCheck(this, ClassInfo);
  _defineProperty(this, "getRunBeforeList", function (functionName) {
    return _this.runBefore[functionName] || [];
  });
  _defineProperty(this, "getDependencies", function (functionName) {
    if (functionName) {
      return _this.funcDeps[functionName] || [];
    }
    return _this.Class.$inject || [];
  });
  _defineProperty(this, "getRunFunction", function (functionName) {
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
        _this.instance = _construct(_this.Class, _toConsumableArray(injectedResult.getResults()).concat(args));
      }
      return _this.instance;
    };
  });
  _defineProperty(this, "run", function (functionName, args, callback) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var func = _this.getRunFunction(functionName, options);
    var result = func.apply(void 0, _toConsumableArray(args));
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
export { ClassInfo as default };