import { createAction } from 'redux-actions';
import { AuthService } from '../../../shared/modules/auth';
import UserActions from '../../../shared/user/actions';

const UserAuthInit = createAction('UserAuthInit', payload => ({
  ...payload,
  loading: true,
  error: null,
  isAuthenticated: false,
  authenticatedUser: {},
}));

const UserAuthSuccess = createAction('UserAuthSuccess', payload => ({
  ...payload,
  loading: false,
  isAuthenticated: true,
}));

const UserAuthFail = createAction('UserAuthFail', payload => ({ ...payload, loading: false }));

export const Types = {
  UserAuthInit,
  UserAuthSuccess,
  UserAuthFail,
};

/**
 * Two ways to authenticate user: through user and password credentials
 * or by checking out its JWT token.
 */
export default function authenticateUser(credentials, onFinished) {
  return (dispatch, getState, { serviceContext } = {}) => {
    const { loading } = getState().user;

    if (loading) {
      // There is ongoing user-related operation. Exit!
      return Promise.resolve();
    }

    dispatch(UserAuthInit({ credentials }));

    const persistToken = token => AuthService.persistToken(serviceContext, token);
    const handleUserAuthSuccess = user => dispatch(UserAuthSuccess({ user }));
    const handleUserAuthError = error => dispatch(UserAuthFail({ error }));
    const sessionId = getState().session.sessionId;
    // We want fresh user information to replace the one stored in cache/state store
    const forcefullyGetUserByToken = token =>
      dispatch(UserActions.getUserByToken({ token, force: true }));

    let authenticate;

    switch (true) {
      case !!credentials.token:
        const { token } = credentials;
        authenticate = forcefullyGetUserByToken(token);
        authenticate.then(handleUserAuthSuccess, handleUserAuthError);
        authenticate.then(() => onFinished && onFinished());
        break;

      case !!(credentials.username && credentials.password):
      default:
        const { username, password } = credentials;
        authenticate = AuthService.authenticateUser(serviceContext, sessionId, {
          username,
          password,
        });

        authenticate.catch(handleUserAuthError);

        authenticate // produced a token
          .then(token => persistToken(token).then(() => token)) // persist token in cookie
          .then(token => forcefullyGetUserByToken(token)) // get user detail by information in the token
          .then(user => handleUserAuthSuccess(user)) // update redux store, notify subscribers
          .then(() => onFinished && onFinished()); // notify caller we are done

        break;
    }

    authenticate.catch(() => onFinished && onFinished());
    return authenticate;
  };
}
