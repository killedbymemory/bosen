import { createAction } from 'redux-actions';
import { AuthService } from '../../../shared/modules/auth';

const UserDeauthInit = createAction('UserDeauthInit', (payload = {}) => ({
  ...payload,
  loading: true,
  error: null,
}));

const UserDeauthSuccess = createAction('UserDeauthSuccess', (payload = {}) => ({
  ...payload,
  loading: false,
  isAuthenticated: false,
  user: {},
}));

const UserDeauthFail = createAction('UserDeauthFail', (payload = {}) => ({
  ...payload,
  loading: false,
}));

export const Types = {
  UserDeauthInit,
  UserDeauthSuccess,
  UserDeauthFail,
};

/**
 * Deauthenticate user by deleting their token from cookie.
 */
export default function deauthenticateUser(onFinished) {
  return (dispatch, getState, { serviceContext } = {}) => {
    if (!getState().user.isAuthenticated) {
      return Promise.resolve();
    }

    dispatch(UserDeauthInit());

    const handleSuccess = token => dispatch(UserDeauthSuccess());
    const handleError = error => dispatch(UserDeauthFail({ error }));
    const _onFinished = () => onFinished && onFinished();
    const deauthenticate = new Promise((resolve) => {
      const result = AuthService.removeToken(serviceContext);

      if (result && result.then) {
        result.then(resolve, reject);
      }

      return resolve();
    });

    deauthenticate.then(handleSuccess, handleError).then(_onFinished);
    deauthenticate.catch(_onFinished);
    return deauthenticate;
  };
}
