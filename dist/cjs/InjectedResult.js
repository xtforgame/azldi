"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/toConsumableArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/defineProperty"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/objectWithoutProperties"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/createClass"));
var _excluded = ["depComponentNames", "deps"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var privateData = new WeakMap();
var InjectedResult = exports["default"] = /*#__PURE__*/function () {
  function InjectedResult(metadataMap, depComponentNames) {
    (0, _classCallCheck2["default"])(this, InjectedResult);
    var deps = {};
    depComponentNames.forEach(function (depComponentName) {
      var classInfo = metadataMap[depComponentName].classInfo;
      var instance = classInfo.instance;
      deps[depComponentName] = {
        classInfo: classInfo,
        instance: instance
      };
    });
    privateData.set(this, {
      metadataMap: metadataMap,
      depComponentNames: depComponentNames,
      deps: deps
    });
  }
  return (0, _createClass2["default"])(InjectedResult, [{
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
        rest = (0, _objectWithoutProperties2["default"])(_privateData$get2, _excluded);
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
      return [this].concat((0, _toConsumableArray2["default"])(args));
    }
  }]);
}();