"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _excluded = ["depComponentNames", "deps"];

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var privateData = new WeakMap();

var InjectedResult = function () {
  function InjectedResult(metadataMap, depComponentNames) {
    _classCallCheck(this, InjectedResult);

    _defineProperty(this, "privateData2", void 0);

    var deps = {};
    depComponentNames.forEach(function (depComponentName) {
      var classInfo = metadataMap[depComponentName].classInfo;
      var instance = classInfo.instance;
      deps[depComponentName] = {
        classInfo: classInfo,
        instance: instance
      };
    });
    this.privateData2 = {
      depComponentNames: depComponentNames
    };
    privateData.set(this, {
      metadataMap: metadataMap,
      depComponentNames: depComponentNames,
      deps: deps
    });
  }

  _createClass(InjectedResult, [{
    key: "getDepsInfo",
    value: function getDepsInfo() {
      var _privateData$get = privateData.get(this),
          deps = _privateData$get.deps;

      return deps;
    }
  }, {
    key: "setResults",
    value: function setResults(results) {
      var _privateData$get2 = privateData.get(this),
          depComponentNames = _privateData$get2.depComponentNames,
          deps = _privateData$get2.deps,
          rest = _objectWithoutProperties(_privateData$get2, _excluded);

      results.forEach(function (result, i) {
        if (i < depComponentNames.length) {
          var depComponentName = depComponentNames[i];
          deps[depComponentName].result = result;
        }
      });
      privateData.set(this, _objectSpread(_objectSpread({
        depComponentNames: depComponentNames,
        deps: deps
      }, rest), {}, {
        results: results
      }));
    }
  }, {
    key: "getResults",
    value: function getResults() {
      var _privateData$get3 = privateData.get(this),
          results = _privateData$get3.results;

      return results;
    }
  }, {
    key: "inject",
    value: function inject(results, args) {
      this.setResults(results);
      return [this].concat(_toConsumableArray(args));
    }
  }]);

  return InjectedResult;
}();

exports["default"] = InjectedResult;