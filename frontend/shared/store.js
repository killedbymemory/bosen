import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import rootReducers from './reducers';

/**
 * This function expects:
 *
 *   1. browser-side code to pass `window` object, it will be used to register Redux Devtools
 *   2. service context that contains `apiClient` instance
 *   3. initial state of redux state store
 *   4. external reducers (e.g.: redux-connect's reducer)
 */
export default ({ window, serviceContext, initialState = {}, reducers = {} } = {}) => {
  // Use Redux devtools' `compose` to enable it
  const composeEnhancers = (window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

  /* eslint-disable no-underscore-dangle */
  return createStore(
    combineReducers(Object.assign({}, rootReducers, reducers)),
    initialState,
    composeEnhancers(applyMiddleware(thunk.withExtraArgument({ serviceContext }))),
  );
  /* eslint-enable */
};
