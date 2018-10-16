import React from 'react';
import Helmet from 'react-helmet';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { AsyncComponentProvider, createAsyncContext } from 'react-async-component';
import asyncBootstrapper from 'react-async-bootstrapper';
import { Provider } from 'react-redux';
import createStore from '../../../shared/store';

import config from '../../../config';

import ServerHTML from './ServerHTML';
import AsyncApplication from '../../../shared/components/AsyncApplication';
import { log } from '../../../internal/utils';

import * as SessionAction from '../../../shared/modules/session/action';
import { Actions as UserActions } from '../../../shared/user/actions';

// ReduxAsyncConnect allows route component(s) to express its data needs
// and help fetch it before rendering the actual component.
// ReduxAsyncConnect is tightly coupled with React Router and Redux store.
import { loadOnServer, ReduxAsyncConnect, reducer as reduxAsyncConnect } from 'redux-connect';
import { parse as parseUrl } from 'url';

// ReduxAsyncConnect requires reference to routes
import routes from '../../../shared/routes';

import { ServiceContext } from '../../../shared/serviceContext';

/**
 * React application middleware, supports server side rendering.
 */
export default function reactApplicationMiddleware(request, response) {
  const { serviceContext } = request;

  // Ensure a nonce has been provided to us.
  // See the server/middleware/security.js for more info.
  if (typeof response.locals.nonce !== 'string') {
    throw new Error('A "nonce" value has not been attached to the response');
  }
  const nonce = response.locals.nonce;

  // Redux's state store
  const store = createStore({ serviceContext, reducers: { reduxAsyncConnect } });

  // Store session identifier in state store
  const sessionId = request.cookies && request.cookies.sessionId;
  store.dispatch(SessionAction.initSessionIdFromCookie(sessionId));

  const token = request.cookies.token;
  const authenticate = () =>
    (token && store.dispatch(UserActions.authenticateUser({ token }))) || Promise.resolve();

  // It's possible to disable SSR, which can be useful in development mode.
  // In this case traditional client side only rendering will occur.
  if (config('disableSSR')) {
    if (process.env.BUILD_FLAG_IS_DEV === 'true') {
      // eslint-disable-next-line no-console
      log({
        title: 'Server',
        level: 'info',
        message: `Handling react route without SSR: ${request.url}`,
      });
    }

    const render = () => {
      // SSR is disabled so we will return an "empty" html page and
      // rely on the client to initialize and render the react application.
      const html = renderToStaticMarkup(
        <ServerHTML nonce={nonce} preloadedState={store.getState()} />,
      );
      response.status(200).send(`<!DOCTYPE html>${html}`);
    };

    return render();
  }

  // Create a context for our AsyncComponentProvider.
  const asyncComponentsContext = createAsyncContext();

  // Create a context for <StaticRouter>, which will allow us to
  // query for the results of the render.
  const reactRouterContext = {};

  // Declare our React application.
  const app = (
    <AsyncComponentProvider asyncContext={asyncComponentsContext}>
      <ServiceContext.Provider value={serviceContext}>
        <Provider store={store}>
          <StaticRouter location={request.url} context={reactRouterContext}>
            <AsyncApplication />
          </StaticRouter>
        </Provider>
      </ServiceContext.Provider>
    </AsyncComponentProvider>
  );

  // Pass our app into the react-async-component helper so that any async
  // components are resolved for the render.
  const startApp = () =>
    asyncBootstrapper(app).then(() => {
      const appString = renderToString(app);

      // Generate the html response.
      const html = renderToStaticMarkup(
        <ServerHTML
          reactAppString={appString}
          nonce={nonce}
          helmet={Helmet.rewind()}
          asyncComponentsState={asyncComponentsContext.getState()}
          preloadedState={store.getState()}
        />,
      );

      // Check if the router context contains a redirect, if so we need to set
      // the specific status and redirect header and end the response.
      if (reactRouterContext.url) {
        response.status(302).setHeader('Location', reactRouterContext.url);
        response.end();
        return;
      }

      response
        .status(
          reactRouterContext.missed
            ? // If the renderResult contains a "missed" match then we set a 404 code.
            // Our App component will handle the rendering of an Error404 view.
            404
            : // Otherwise everything is all good and we send a 200 OK status.
            200,
        )
        .send(`<!DOCTYPE html>${html}`);
    });

  // Populate all the data required by route component(s) that matches requested URL,
  // but only those not deferred (meaning only those tasks that meant to run on server).
  const getInitialData = () =>
    loadOnServer({
      location: parseUrl(request.url),
      routes,
      store,
      helpers: serviceContext,
      filter: (item, component) => !item.deferred,
    });

  // Authenticate user session and get route components data before rendering
  authenticate()
    .then(getInitialData)
    .then(startApp);
}
