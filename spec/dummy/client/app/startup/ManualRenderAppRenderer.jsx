import React from 'react';
import ReactDOM from 'react-dom';

export default (props, railsContext, domNodeId) => {
  const reactElement = (
    <div>
      <h1>Manual Render Example</h1>
      <p>If you can see this, registerRenderer works.</p>
    </div>
  );

  ReactDOM.render(reactElement, document.getElementById(domNodeId));
};