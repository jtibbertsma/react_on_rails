'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _generatorFunction = require('./generatorFunction');

var _generatorFunction2 = _interopRequireDefault(_generatorFunction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var registeredComponents = new _map2.default(); // key = name used by react_on_rails
// value = { name, component, generatorFunction: boolean }
exports.default = {
  /**
   * @param components { component1: component1, component2: component2, etc. }
   */
  register: function register(components) {
    (0, _keys2.default)(components).forEach(function (name) {
      if (registeredComponents.has(name)) {
        console.warn('Called register for component that is already registered', name);
      }

      var component = components[name];
      if (!component) {
        throw new Error('Called register with null component named ' + name);
      }

      var isGeneratorFunction = (0, _generatorFunction2.default)(component);

      registeredComponents.set(name, {
        name: name,
        component: component,
        generatorFunction: isGeneratorFunction,
        isRenderer: false
      });
    });
  },


  /**
   * @param renderers { renderers1: renderers1, renderers2: renderers2, etc. }
   */
  registerRenderer: function registerRenderer(renderers) {
    (0, _keys2.default)(renderers).forEach(function (name) {
      if (registeredComponents.has(name)) {
        console.warn('Called registerRenderer for component that is already registered', name);
      }

      var renderer = renderers[name];

      // A renderer must be a function
      if (!(0, _generatorFunction2.default)(renderer)) {
        throw new Error('Called registerRenderer without passing a function; component name is ' + name);
      }

      registeredComponents.set(name, {
        name: name,
        component: renderer,
        generatorFunction: false,
        isRenderer: true
      });
    });
  },


  /**
   * @param name
   * @returns { name, component, generatorFunction }
   */
  get: function get(name) {
    if (registeredComponents.has(name)) {
      return registeredComponents.get(name);
    }

    var keys = (0, _from2.default)(registeredComponents.keys()).join(', ');
    throw new Error('Could not find component registered with name ' + name + '. Registered component names include [ ' + keys + ' ]. Maybe you forgot to register the component?');
  },


  /**
   * Get a Map containing all registered components. Useful for debugging.
   * @returns Map where key is the component name and values are the
   * { name, component, generatorFunction}
   */
  components: function components() {
    return registeredComponents;
  }
};