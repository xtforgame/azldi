"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ClassInfo = function ClassInfo(Class) {
  var _this = this;

  _classCallCheck(this, ClassInfo);

  _defineProperty(this, "Class", void 0);

  _defineProperty(this, "name", void 0);

  _defineProperty(this, "instance", void 0);

  _defineProperty(this, "funcDeps", void 0);

  _defineProperty(this, "runBefore", void 0);

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
    if (_this.instance && functionName) {
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
    var func = _this.getRunFunction(functionName);

    var result = func.apply(void 0, _toConsumableArray(args));
    callback({
      args: args,
      result: result,
      classInfo: _this
    });
    return result;
  });

  this.Class = Class;
  this.name = this.Class.$name;
  this.instance = undefined;
  this.funcDeps = this.Class.$funcDeps || {};
  this.runBefore = this.Class.$runBefore || {};
};

exports["default"] = ClassInfo;