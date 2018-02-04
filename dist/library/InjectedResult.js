'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var privateData = new WeakMap();

var InjectedResult = function () {
  function InjectedResult(metadataMap, depComponentNames) {
    _classCallCheck(this, InjectedResult);

    var deps = {};
    depComponentNames.map(function (depComponentName) {
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

  _createClass(InjectedResult, [{
    key: 'getDepsInfo',
    value: function getDepsInfo() {
      var _privateData$get = privateData.get(this),
          deps = _privateData$get.deps;

      return deps;
    }
  }, {
    key: 'setResults',
    value: function setResults(results) {
      var _privateData$get2 = privateData.get(this),
          depComponentNames = _privateData$get2.depComponentNames,
          deps = _privateData$get2.deps,
          rest = _objectWithoutProperties(_privateData$get2, ['depComponentNames', 'deps']);

      results.map(function (result, i) {
        var depComponentName = depComponentNames[i];
        deps[depComponentName]['result'] = result;
      });

      privateData.set(this, _extends({
        depComponentNames: depComponentNames,
        deps: deps
      }, rest, {
        results: results
      }));
    }
  }, {
    key: 'getResults',
    value: function getResults() {
      var _privateData$get3 = privateData.get(this),
          results = _privateData$get3.results;

      return results;
    }
  }, {
    key: 'inject',
    value: function inject(results, args) {
      this.setResults(results);
      return [this].concat(_toConsumableArray(args));
    }
  }]);

  return InjectedResult;
}();

exports.default = InjectedResult;