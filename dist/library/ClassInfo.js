"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ClassInfo = function ClassInfo(Class) {
  var _this = this;

  _classCallCheck(this, ClassInfo);

  this.getDependencies = function (functionName) {
    if (functionName) {
      return _this.funcDeps[functionName] || [];
    }
    return _this.Class.$inject || [];
  };

  this.getRunFunction = function (functionName) {
    if (_this.instance && functionName) {
      return function () {
        var _instance;

        return (_instance = _this.instance)[functionName].apply(_instance, arguments);
      };
    }
    return function (injectedResult) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      _this.instance = _this.instance || new (Function.prototype.bind.apply(_this.Class, [null].concat(_toConsumableArray(injectedResult.getResults()), args)))();
      return _this.instance;
    };
  };

  this.run = function (functionName, args, callback) {
    var func = _this.getRunFunction(functionName);
    var result = func.apply(undefined, _toConsumableArray(args));
    callback({
      args: args,
      result: result,
      classInfo: _this
    });
    return result;
  };

  this.Class = Class;
  this.name = this.Class.$name;
  this.instance = null;
  this.funcDeps = this.Class.$funcDeps || {};
};

exports.default = ClassInfo;