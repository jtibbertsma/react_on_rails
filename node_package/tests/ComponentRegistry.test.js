/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prefer-es6-class */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable react/jsx-filename-extension */

import test from 'tape';
import React from 'react';

import ComponentRegistry from '../src/ComponentRegistry';

test('ComponentRegistry registers and retrieves generator function components', (assert) => {
  assert.plan(1);
  const C1 = () => <div>HELLO</div>;
  ComponentRegistry.register({ C1 });
  const actual = ComponentRegistry.get('C1');
  const expected = { name: 'C1', component: C1, generatorFunction: true, isRenderer: false };
  assert.deepEqual(actual, expected,
    'ComponentRegistry should store and retrieve a generator function');
});

test('ComponentRegistry registers and retrieves ES5 class components', (assert) => {
  assert.plan(1);
  const C2 = React.createClass({
    render() {
      return <div> WORLD </div>;
    },
  });
  ComponentRegistry.register({ C2 });
  const actual = ComponentRegistry.get('C2');
  const expected = { name: 'C2', component: C2, generatorFunction: false, isRenderer: false };
  assert.deepEqual(actual, expected,
    'ComponentRegistry should store and retrieve a ES5 class');
});

test('ComponentRegistry registers and retrieves ES6 class components', (assert) => {
  assert.plan(1);
  class C3 extends React.Component {
    render() {
      return (
        <div>Wow!</div>
      );
    }
  }
  ComponentRegistry.register({ C3 });
  const actual = ComponentRegistry.get('C3');
  const expected = { name: 'C3', component: C3, generatorFunction: false, isRenderer: false };
  assert.deepEqual(actual, expected,
    'ComponentRegistry should store and retrieve a ES6 class');
});

test('ComponentRegistry registers and retrieves renderers', (assert) => {
  assert.plan(1);
  const C4 = () => null;
  ComponentRegistry.registerRenderer({ C4 });
  const actual = ComponentRegistry.get('C4');
  const expected = { name: 'C4', component: C4, generatorFunction: false, isRenderer: true };
  assert.deepEqual(actual, expected,
    'ComponentRegistry registers and retrieves renderers');
});

/*
 * NOTE: Since ComponentRegistry is a singleton, it preserves value as the tests run.
 * Thus, tests are cummulative.
 */
test('ComponentRegistry registers and retrieves multiple components', (assert) => {
  assert.plan(3);
  const C5 = () => <div>WHY</div>;
  const C6 = () => <div>NOW</div>;
  ComponentRegistry.register({ C5 });
  ComponentRegistry.register({ C6 });
  const components = ComponentRegistry.components();
  assert.equal(components.size, 6, 'size should be 6');
  assert.deepEqual(components.get('C5'),
    { name: 'C5', component: C5, generatorFunction: true, isRenderer: false });
  assert.deepEqual(components.get('C6'),
    { name: 'C6', component: C6, generatorFunction: true, isRenderer: false });
});

test('ComponentRegistry throws error for retrieving unregistered component', (assert) => {
  assert.plan(1);
  assert.throws(() => ComponentRegistry.get('foobar'),
    /Could not find component registered with name foobar/,
    'Expected an exception for calling ComponentRegistry.get with an invalid name.'
  );
});

test('ComponentRegistry throws error for setting null component', (assert) => {
  assert.plan(1);
  const C7 = null;
  assert.throws(() => ComponentRegistry.register({ C7 }),
    /Called register with null component named C7/,
    'Expected an exception for calling ComponentRegistry.set with a null component.'
  );
});

test('ComponentRegistry registerRenderer throws error unless given a function', (assert) => {
  assert.plan(1);
  const C8 = React.createClass({
    render() {
      return <div>stahp</div>;
    },
  });
  assert.throws(() => ComponentRegistry.registerRenderer({ C8 }),
    /Called registerRenderer without passing a function/,
    'Expected an exception for calling ComponentRegistry.registerRenderer without a function.'
  );
});
