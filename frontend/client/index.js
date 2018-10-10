/* eslint-disable global-require */
import React from 'react';
import { render } from 'react-dom';
import BrowserRouter from 'react-router-dom/BrowserRouter';
import asyncBootstrapper from 'react-async-bootstrapper';
import { AsyncComponentProvider } from 'react-async-component';
import { Provider } from 'react-redux';
import createStore from '../shared/store';

import './polyfills';

import ReactHotLoader from './components/ReactHotLoader';
import Application from '../shared/components/Application';
import config from '../config';

// ReduxAsyncConnect allows route component(s) to express its data needs
// and help fetch that data before rendering the actual component.
// It's tightly coupled with React Router and the routes.
import { ReduxAsyncConnect, reducer as reduxAsyncConnect } from 'redux-connect';
import routes from '../shared/routes';

// Required by Axios (HTTP client) to get auth token to be associated with API calls
import { AuthService } from '../shared/modules/auth';

// Required for authenticating user token
import { Actions as UserActions } from '../shared/user/actions';

// Required for providing Service Context access from component hierarchy
import { ServiceContext } from '../shared/serviceContext';

// Get the DOM Element that will host our React application.
const container = document.querySelector('#app');

// Does the user's browser support the HTML5 history API?
// If the user's browser doesn't support the HTML5 history API then we
// will force full page refreshes on each page change.
const supportsHistory = 'pushState' in window.history;

// Get any rehydrateState for the async components.
// eslint-disable-next-line no-underscore-dangle
const asyncComponentsRehydrateState = window.__ASYNC_COMPONENTS_REHYDRATE_STATE__;

// API Client
function CoreBackendClient(config) {
  const { protocol, host, port, basePath } = config;
  const _config = Object.assign(
    {},
    {
      baseURL: `${protocol}${host}:${port}${basePath}`,
    },
  );

  console.log('CoreBackendClient configured to', _config);
  const instance = require('axios').create(_config);

  instance.interceptors.request.use((config) => {
    const token = AuthService.getToken();

    if (token) {
      return Object.assign({}, config, {
        headers: Object.assign({}, config.headers, {
          Authorization: `Bearer ${token}`,
        }),
      });
    }

    return config;
  });

  return instance;
}

const apiClient = new CoreBackendClient(config('core.backend'));
const serviceContext = { apiClient };

// Preloaded state
const initialState = window.__PRELOADED_STATE__;
delete window.__PRELOADED_STATE__;

// Redux's state store
const store = createStore({
  window,
  serviceContext,
  initialState,
  reducers: { reduxAsyncConnect },
});

/**
 * Renders the given React Application component.
 */
function renderApp(TheApp) {
  // Firstly, define our full application component, wrapping the given
  // component app with a browser based version of react router.
  const app = (
    <ReactHotLoader>
      <AsyncComponentProvider rehydrateState={asyncComponentsRehydrateState}>
        <ServiceContext.Provider value={serviceContext}>
          <Provider store={store}>
            <BrowserRouter forceRefresh={!supportsHistory}>
              <ReduxAsyncConnect routes={routes} helpers={{ serviceContext }} render={TheApp} />
            </BrowserRouter>
          </Provider>
        </ServiceContext.Provider>
      </AsyncComponentProvider>
    </ReactHotLoader>
  );

  // We use the react-async-component in order to support code splitting of
  // our bundle output. It's important to use this helper.
  // @see https://github.com/ctrlplusb/react-async-component
  asyncBootstrapper(app).then(() => render(app, container));
}

const token = AuthService.getToken();
const authenticateUser = token =>
  (token && store.dispatch(UserActions.authenticateUser({ token }))) || Promise.resolve();
const deauthenticateUser = () => store.dispatch(UserActions.deauthenticateUser());

authenticateUser(token)
  .catch(deauthenticateUser)
  .then(() => renderApp(Application));

// This registers our service worker for asset caching and offline support.
// Keep this as the last item, just in case the code execution failed (thanks
// to react-boilerplate for that tip.)
require('./registerServiceWorker');

// The following is needed so that we can support hot reloading our application.
if (process.env.BUILD_FLAG_IS_DEV === 'true' && module.hot) {
  // Accept changes to this file for hot reloading.
  module.hot.accept('./index.js');
  // Any changes to our App will cause a hotload re-render.
  module.hot.accept('../shared/components/Application', () => {
    renderApp(require('../shared/components/Application').default);
  });
}
