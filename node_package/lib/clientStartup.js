'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.reactOnRailsPageLoaded = reactOnRailsPageLoaded;
exports.clientStartup = clientStartup;

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _createReactElement = require('./createReactElement');

var _createReactElement2 = _interopRequireDefault(_createReactElement);

var _isRouterResult = require('./isRouterResult');

var _isRouterResult2 = _interopRequireDefault(_isRouterResult);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var REACT_ON_RAILS_COMPONENT_CLASS_NAME = 'js-react-on-rails-component'; /* global ReactOnRails Turbolinks */

var REACT_ON_RAILS_STORE_CLASS_NAME = 'js-react-on-rails-store';

function findContext() {
  if (typeof window.ReactOnRails !== 'undefined') {
    return window;
  } else if (typeof ReactOnRails !== 'undefined') {
    return global;
  }

  throw new Error('ReactOnRails is undefined in both global and window namespaces.\n  ');
}

function debugTurbolinks() {
  if (!window) {
    return;
  }

  var context = findContext();
  if (context.ReactOnRails.option('traceTurbolinks')) {
    var _console;

    for (var _len = arguments.length, msg = Array(_len), _key = 0; _key < _len; _key++) {
      msg[_key] = arguments[_key];
    }

    (_console = console).log.apply(_console, ['TURBO:'].concat(msg));
  }
}

function turbolinksInstalled() {
  return typeof Turbolinks !== 'undefined';
}

function forEach(fn, className, railsContext) {
  var els = document.getElementsByClassName(className);
  for (var i = 0; i < els.length; i++) {
    fn(els[i], railsContext);
  }
}

function forEachComponent(fn, railsContext) {
  forEach(fn, REACT_ON_RAILS_COMPONENT_CLASS_NAME, railsContext);
}

function initializeStore(el, railsContext) {
  var context = findContext();
  var name = el.getAttribute('data-store-name');
  var props = JSON.parse(el.getAttribute('data-props'));
  var storeGenerator = context.ReactOnRails.getStoreGenerator(name);
  var store = storeGenerator(props, railsContext);
  context.ReactOnRails.setStore(name, store);
}

function forEachStore(railsContext) {
  forEach(initializeStore, REACT_ON_RAILS_STORE_CLASS_NAME, railsContext);
}

function turbolinksVersion5() {
  return typeof Turbolinks.controller !== 'undefined';
}

function delegateToRenderer(componentObj, props, railsContext, domNodeId) {
  var component = componentObj.component;
  var isRenderer = componentObj.isRenderer;


  if (isRenderer) {
    component(props, railsContext, domNodeId);
    return true;
  }

  return false;
}

/**
 * Used for client rendering by ReactOnRails. Either calls ReactDOM.render or delegates
 * to a renderer registered by the user.
 * @param el
 */
function render(el, railsContext) {
  var context = findContext();
  var name = el.getAttribute('data-component-name');
  var domNodeId = el.getAttribute('data-dom-id');
  var props = JSON.parse(el.getAttribute('data-props'));
  var trace = JSON.parse(el.getAttribute('data-trace'));

  try {
    var domNode = document.getElementById(domNodeId);
    if (domNode) {
      var componentObj = context.ReactOnRails.getComponent(name);
      if (delegateToRenderer(componentObj, props, railsContext, domNodeId)) {
        return;
      }

      var reactElementOrRouterResult = (0, _createReactElement2.default)({
        componentObj: componentObj,
        props: props,
        domNodeId: domNodeId,
        trace: trace,
        railsContext: railsContext
      });

      if ((0, _isRouterResult2.default)(reactElementOrRouterResult)) {
        throw new Error('You returned a server side type of react-router error: ' + (0, _stringify2.default)(reactElementOrRouterResult) + '\nYou should return a React.Component always for the client side entry point.');
      } else {
        _reactDom2.default.render(reactElementOrRouterResult, domNode);
      }
    }
  } catch (e) {
    e.message = 'ReactOnRails encountered an error while rendering component: ' + name + '.' + ('Original message: ' + e.message);
    throw e;
  }
}

function parseRailsContext() {
  var el = document.getElementById('js-react-on-rails-context');
  if (el) {
    return JSON.parse(el.getAttribute('data-rails-context'));
  }

  return null;
}

function reactOnRailsPageLoaded() {
  debugTurbolinks('reactOnRailsPageLoaded');

  var railsContext = parseRailsContext();
  forEachStore(railsContext);
  forEachComponent(render, railsContext);
}

function unmount(el) {
  var domNodeId = el.getAttribute('data-dom-id');
  var domNode = document.getElementById(domNodeId);
  _reactDom2.default.unmountComponentAtNode(domNode);
}

function reactOnRailsPageUnloaded() {
  debugTurbolinks('reactOnRailsPageUnloaded');
  forEachComponent(unmount);
}

function clientStartup(context) {
  var document = context.document;

  // Check if server rendering
  if (!document) {
    return;
  }

  // Tried with a file local variable, but the install handler gets called twice.
  // eslint-disable-next-line no-underscore-dangle
  if (context.__REACT_ON_RAILS_EVENT_HANDLERS_RAN_ONCE__) {
    return;
  }

  // eslint-disable-next-line no-underscore-dangle
  context.__REACT_ON_RAILS_EVENT_HANDLERS_RAN_ONCE__ = true;

  debugTurbolinks('Adding DOMContentLoaded event to install event listeners.');

  document.addEventListener('DOMContentLoaded', function () {
    // Install listeners when running on the client (browser).
    // We must do this check for turbolinks AFTER the document is loaded because we load the
    // Webpack bundles first.

    if (!turbolinksInstalled()) {
      debugTurbolinks('NOT USING TURBOLINKS: DOMContentLoaded event, calling reactOnRailsPageLoaded');
      reactOnRailsPageLoaded();
    } else if (turbolinksVersion5()) {
      debugTurbolinks('USING TURBOLINKS 5: document added event listeners turbolinks:before-render and ' + 'turbolinks:load.');
      document.addEventListener('turbolinks:before-render', reactOnRailsPageUnloaded);
      document.addEventListener('turbolinks:load', reactOnRailsPageLoaded);
    } else {
      debugTurbolinks('USING TURBOLINKS 2: document added event listeners page:before-unload and ' + 'page:change.');
      document.addEventListener('page:before-unload', reactOnRailsPageUnloaded);
      document.addEventListener('page:change', reactOnRailsPageLoaded);
    }
  });
}