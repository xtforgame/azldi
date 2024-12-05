import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
var _excluded = ["depComponentNames", "deps"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var privateData = new WeakMap();
var InjectedResult = /*#__PURE__*/function () {
  function InjectedResult(metadataMap, depComponentNames) {
    _classCallCheck(this, InjectedResult);
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
  return _createClass(InjectedResult, [{
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
}();
export { InjectedResult as default };