import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import HelloWorldRedux from './HelloWorldRedux';

import * as helloWorldActions from '../actions/HelloWorldActions';

const HelloWorldContainer = ({ actions, data, locationData }) => {
  console.log("ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ");
  console.log("HelloWorldContainer");
  console.log("location = ", locationData);
  console.log("data = ", data);
  console.log("ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ");

  return (
    <HelloWorldRedux {...{actions, data, locationData}} />
  );
}
HelloWorldContainer.propTypes = {
  actions: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  locationData: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  console.log("ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ");
  console.log("mapStateToProps");
  console.log("state", state);
  console.log("ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ");

  return { 
    data: state.helloWorldData,
    locationData: state.locationData,
  };
}

function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(helloWorldActions, dispatch) };
}

// Don't forget to actually use connect!
export default connect(mapStateToProps, mapDispatchToProps)(HelloWorldContainer);
