"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
exports["default"] = void 0;

var _ClassInfo = _interopRequireDefault(require("./ClassInfo"));

var _ComponentMetadata = _interopRequireDefault(require("./ComponentMetadata"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

    _classCallCheck(this, Azldi);

    _defineProperty(this, "get", function (name) {
      var classInfo = _this.classInfoMap[name];
      return classInfo && classInfo.instance;
    });

    _defineProperty(this, "getClassInfo", function (name) {
      return _this.classInfoMap[name];
    });

    this.classInfoMap = {};
    this.classInfoArray = [];
  }

  _createClass(Azldi, [{
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
          runSync: runSync
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
          _ref$appendArgs = _ref.appendArgs,
          appendArgs = _ref$appendArgs === void 0 ? {} : _ref$appendArgs;

      return this._run(undefined, [], appendArgs, onCreate, true);
    }
  }, {
    key: "run",
    value: function run(functionName) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref2$onResult = _ref2.onResult,
          onResult = _ref2$onResult === void 0 ? function () {} : _ref2$onResult,
          _ref2$appendArgs = _ref2.appendArgs,
          appendArgs = _ref2$appendArgs === void 0 ? {} : _ref2$appendArgs;

      return this._run(functionName, args, appendArgs, onResult, true);
    }
  }, {
    key: "runAsync",
    value: function runAsync(functionName) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref3$onResult = _ref3.onResult,
          onResult = _ref3$onResult === void 0 ? function () {} : _ref3$onResult,
          _ref3$appendArgs = _ref3.appendArgs,
          appendArgs = _ref3$appendArgs === void 0 ? {} : _ref3$appendArgs;

      return this._run(functionName, args, appendArgs, onResult, false);
    }
  }]);

  return Azldi;
}();

exports["default"] = Azldi;