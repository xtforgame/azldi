'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ComponentMetadata = exports.ClassInfo = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ClassInfo = require('./ClassInfo');

var _ClassInfo2 = _interopRequireDefault(_ClassInfo);

var _ComponentMetadata = require('./ComponentMetadata');

var _ComponentMetadata2 = _interopRequireDefault(_ComponentMetadata);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

exports.ClassInfo = _ClassInfo2.default;
exports.ComponentMetadata = _ComponentMetadata2.default;

var Azldi = function () {
  function Azldi() {
    var _this = this;

    _classCallCheck(this, Azldi);

    this.get = function (name) {
      var classInfo = _this.classInfoMap[name];
      return classInfo && classInfo.instance;
    };

    this.getClassInfo = function (name) {
      return _this.classInfoMap[name];
    };

    this.classInfoMap = {};
    this.classInfoArray = [];
  }

  _createClass(Azldi, [{
    key: 'register',
    value: function register(Classes) {
      var _this2 = this;

      if (Array.isArray(Classes)) {
        return Classes.map(function (Class) {
          return _this2.register(Class);
        });
      }

      var classInfo = new _ClassInfo2.default(Classes);
      this.classInfoMap[classInfo.name] = classInfo;
      this.classInfoArray.push(classInfo);

      return true;
    }
  }, {
    key: '_run',
    value: function _run(functionName, args, appendArgs, callback) {
      var runSync = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

      var metadataMap = {};
      var metadataArray = [];
      this.classInfoArray.forEach(function (classInfo) {
        var componentMetadata = new _ComponentMetadata2.default({
          classInfo: classInfo,
          metadataMap: metadataMap,
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
        }).apply(undefined, _toConsumableArray(args));
        return result;
      });

      return runSync ? results : Promise.all(results);
    }
  }, {
    key: 'digest',
    value: function digest() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$onCreate = _ref.onCreate,
          onCreate = _ref$onCreate === undefined ? function () {} : _ref$onCreate,
          _ref$appendArgs = _ref.appendArgs,
          appendArgs = _ref$appendArgs === undefined ? {} : _ref$appendArgs;

      return this._run(undefined, [], appendArgs, onCreate, true);
    }
  }, {
    key: 'run',
    value: function run(functionName) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref2$onResult = _ref2.onResult,
          onResult = _ref2$onResult === undefined ? function () {} : _ref2$onResult,
          _ref2$appendArgs = _ref2.appendArgs,
          appendArgs = _ref2$appendArgs === undefined ? {} : _ref2$appendArgs;

      return this._run(functionName, args, appendArgs, onResult, true);
    }
  }, {
    key: 'runAsync',
    value: function runAsync(functionName) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref3$onResult = _ref3.onResult,
          onResult = _ref3$onResult === undefined ? function () {} : _ref3$onResult,
          _ref3$appendArgs = _ref3.appendArgs,
          appendArgs = _ref3$appendArgs === undefined ? {} : _ref3$appendArgs;

      return this._run(functionName, args, appendArgs, onResult, false);
    }
  }]);

  return Azldi;
}();

exports.default = Azldi;