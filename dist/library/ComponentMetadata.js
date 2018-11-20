'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp, _initialiseProps;

var _InjectedResult = require('./InjectedResult');

var _InjectedResult2 = _interopRequireDefault(_InjectedResult);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComponentMetadata = (_temp = _class = function () {
  function ComponentMetadata(_ref) {
    var classInfo = _ref.classInfo,
        metadataMap = _ref.metadataMap,
        runBeforeMap = _ref.runBeforeMap,
        functionName = _ref.functionName,
        _ref$appendArgs = _ref.appendArgs,
        appendArgs = _ref$appendArgs === undefined ? [] : _ref$appendArgs;

    _classCallCheck(this, ComponentMetadata);

    _initialiseProps.call(this);

    this.classInfo = classInfo;
    this.metadataMap = metadataMap;
    this.runBeforeList = runBeforeMap[this.name] || [];
    this.functionName = this.classInfo.instance && functionName;
    this.appendArgs = appendArgs;

    this.resetState();
  }

  _createClass(ComponentMetadata, [{
    key: 'resetState',
    value: function resetState() {
      this.depResolving = false;
      this.processFunc = null;
      this.isDone = false;
      this.result = null;
    }
  }, {
    key: '_resolve',
    value: function _resolve(options) {
      var _this = this;

      if (this.depResolving) {
        throw new Error('Circular dependencies occured :' + this.name);
      }

      this.depResolving = true;

      this.depComponentNames = this.classInfo.getDependencies(this.functionName);
      this.depRunFuncs = [].concat(_toConsumableArray(this.depComponentNames), _toConsumableArray(this.runBeforeList)).map(function (dep) {
        var depComponentMetadata = _this.metadataMap[dep];
        if (!depComponentMetadata) {
          throw new Error('Component not Found :' + dep);
        }
        return depComponentMetadata.getProcessFunc(options);
      });

      this.depResolving = false;
    }
  }, {
    key: 'name',
    get: function get() {
      return this.classInfo.name;
    }
  }]);

  return ComponentMetadata;
}(), _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.run = function (functionName, args, callback) {
    if (_this2.isDone) {
      return _this2.result;
    }
    _this2.result = _this2.classInfo.run(functionName, [].concat(_toConsumableArray(args), _toConsumableArray(_this2.appendArgs)), callback);
    _this2.isDone = true;
    return _this2.result;
  };

  this.getProcessFunc = function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (_this2.processFunc) {
      return _this2.processFunc;
    }

    var callback = options.callback || function () {};
    var runSync = options.runSync !== null ? options.runSync : true;

    _this2._resolve(options);

    var injectedResult = new _InjectedResult2.default(_this2.metadataMap, _this2.depComponentNames);
    if (runSync) {
      _this2.processFunc = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _this2.run(_this2.functionName, injectedResult.inject(_this2.depRunFuncs.map(function (depRunFunc) {
          return depRunFunc.apply(undefined, args);
        }), args), callback);
      };
    } else {
      _this2.processFunc = function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return Promise.all(_this2.depRunFuncs.map(function (depRunFunc) {
          return depRunFunc.apply(undefined, args);
        })).then(function (results) {
          return _this2.run(_this2.functionName, injectedResult.inject(results, args), callback);
        });
      };
    }
    return _this2.processFunc;
  };
}, _temp);
exports.default = ComponentMetadata;