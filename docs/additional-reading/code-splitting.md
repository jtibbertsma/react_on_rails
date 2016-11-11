# Code Splitting

What is code splitting? From the webpack documentation:

> For big web apps it’s not efficient to put all code into a single file, especially if some blocks of code are only required under some circumstances. Webpack has a feature to split your codebase into “chunks” which are loaded on demand. Some other bundlers call them “layers”, “rollups”, or “fragments”. This feature is called “code splitting”.

## Server Rendering and Code Splitting

Let's say you're requesting a page that needs to fetch a code chunk from the server before it's able to render. If you do all your rendering on the client side, you don't have to do anything special. However, if the page is rendered on the server, you'll find that React will spit out the following error:

```
Warning: React attempted to reuse markup in a container but the checksum was invalid. This generally means that you are using server rendering and the markup generated on the server was not what the client was expecting. React injected new markup to compensate which works but you have lost many of the benefits of server rendering. Instead, figure out why the markup being generated is different on the client or server:
 (client) <!-- react-empty: 1 -
 (server) <div data-reactroot="
```
<!--This comment is here because the comment beginning on line 13 messes up Sublime's markdown parsing-->

Different markup is generated on the client than on the server. Why does this happen? When you register a component with `ReactOnRails.register`, react on rails will render the component as soon as the page loads. However, react-router renders a comment while waiting for the code chunk to be fetched from the server. This means that react will tear all of the server rendered code out of the DOM, and then rerender it a moment later once the code chunk arrives from the server, defeating most of the purpose of server rendering.

### The solution

To prevent this, you have to wait until the code chunk is fetched before doing the initial render on the client side. To accomplish this, react on rails provides a javascript API `registerRenderer`. This works rather like registering a generator function with `register`, except that the function you pass takes three arguments: `renderer(props, railsContext, domNodeId)`, and is responsible for calling `ReactDOM.render` to render the component to the DOM.

Here's an example of how you might use this in practice:

page.html.erb
```erb
<%= redux_store_hydration_data %>
<%= react_component("NavigationApp", prerender: true) %>
<%= react_component("RouterApp", prerender: true) %>
```

clientRegistration.js
```js
import ReactOnRails from 'react-on-rails';
import NavigationApp from './NavigationApp';
import RouterApp from './RouterAppRenderer';
import applicationStore from '../store/applicationStore';

ReactOnRails.registerStore({applicationStore});
ReactOnRails.register({NavigationApp});
ReactOnRails.registerRenderer({RouterApp});
```

RouterAppRenderer.jsx
```jsx
import ReactOnRails from 'react-on-rails';
import React from 'react';
import ReactDOM from 'react-dom';
import Router from 'react-router/lib/Router';
import match from 'react-router/lib/match';
import browserHistory from 'react-router/lib/browserHistory';
import { Provider } from 'react-redux';

import routes from '../routes/routes';


const RouterApp = (props, railsContext, domNodeId) => {
  const store = ReactOnRails.getStore('applicationStore');

  match({ history: browserHistory, routes }, (error, redirectionLocation, renderProps) => {
    if (error) {
      throw error;
    }

    const component = (
      <Provider store={store}>
        <Router {...renderProps} />
      </Provider>
    );

    ReactDOM.render(component, document.getElementById(domNodeId));
  });
};

export default RouterApp;
```

What's going on in this example is that we're putting the rendering code in the callback passed to `match`. The effect is that the client render doesn't happen until the code chunk gets fetched from the server, preventing the client/server code mismatch.

Note that in page.html.erb, we call `react_component` in the exact same way as if we were going to call `register` in the startup code.

### Caveats

If you're going to try to do code splitting with server rendered routes, it's important that you have seperate webpack configurations for client and server. The code splitting happens for the client, but the server should one big file.

The reason is we do server rendering with ExecJS, which is not capable of doing anything asynchronous. See [this issue](https://github.com/shakacode/react_on_rails/issues/477) for a discussion.

The `registerRenderer` API should not be used in the server bundle; `register` should be used instead. If you attempt to server render a component registered by `registerRenderer` in the server bundle, you'll get an error.

## How does Webpack know where to find my code chunks?

Add the following to the output key of your webpack config:

```js
config = {
  output: {
    publicPath: '/assets/',
  }
};
```

This causes Webpack to prepend the code chunk filename with `/assets/` in the request url.

See [rails-assets.md](./rails-assets.md) to learn more about static assets.
