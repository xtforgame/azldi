"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _InjectedResult = _interopRequireDefault(require("./InjectedResult"));

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

var ComponentMetadata = function () {
  function ComponentMetadata(_ref) {
    var _this = this;

    var classInfo = _ref.classInfo,
        metadataMap = _ref.metadataMap,
        runBeforeMap = _ref.runBeforeMap,
        _functionName = _ref.functionName,
        _ref$appendArgs = _ref.appendArgs,
        appendArgs = _ref$appendArgs === void 0 ? [] : _ref$appendArgs;

    _classCallCheck(this, ComponentMetadata);

    _defineProperty(this, "classInfo", void 0);

    _defineProperty(this, "metadataMap", void 0);

    _defineProperty(this, "runBeforeList", void 0);

    _defineProperty(this, "functionName", void 0);

    _defineProperty(this, "appendArgs", void 0);

    _defineProperty(this, "depComponentNames", void 0);

    _defineProperty(this, "depRunFuncs", void 0);

    _defineProperty(this, "depResolving", void 0);

    _defineProperty(this, "processFunc", void 0);

    _defineProperty(this, "isDone", void 0);

    _defineProperty(this, "result", void 0);

    _defineProperty(this, "run", function (functionName, args, callback) {
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      if (_this.isDone) {
        return _this.result;
      }

      _this.result = _this.classInfo.run(functionName, [].concat(_toConsumableArray(args), _toConsumableArray(_this.appendArgs)), callback, {
        ignoreNonexecutable: options.ignoreNonexecutable
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

      var injectedResult = new _InjectedResult["default"](_this.metadataMap, _this.depComponentNames);

      if (runSync) {
        _this.processFunc = function () {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return _this.run(_this.functionName, injectedResult.inject(_this.depRunFuncs.map(function (depRunFunc) {
            return depRunFunc.apply(void 0, args);
          }), args), callback);
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

  _createClass(ComponentMetadata, [{
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

  return ComponentMetadata;
}();

exports["default"] = ComponentMetadata;