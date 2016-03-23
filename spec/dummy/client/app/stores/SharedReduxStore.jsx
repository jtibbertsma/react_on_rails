import { combineReducers, applyMiddleware, createStore } from 'redux';
import middleware from 'redux-thunk';

import reducers from '../reducers/reducersIndex';

/*
 *  Export a function that takes the props and returns a Redux store
 *  This is used so that 2 components can have the same store.
 */
export default (props, location) => {
  const combinedReducer = combineReducers(reducers);

  // You can add the location to any property of props. Naturally, pick something that does not
  // conflict.
  console.log("ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ");
  console.log("sharedReduxStore");
  console.log("props = ", props);
  console.log("location = ", location);
  console.log("ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ");

  props.locationData = { location };
  return applyMiddleware(middleware)(createStore)(combinedReducer, props);
};
