import { createAction } from 'redux-actions';
import UserService from '../UserService';

const GetUserInit = createAction('GetUserInit', payload => ({
  ...payload,
  loading: true,
  error: null,
}));

const GetUserSuccess = createAction('GetUserSuccess', payload => ({ ...payload, loading: false }));

const GetUserFail = createAction('GetUserFail', payload => ({ ...payload, loading: false }));

export const Types = {
  GetUserInit,
  GetUserFail,
  GetUserSuccess,
};

/**
 * Get user detail with 'force' option will bypass loading and cache check
 */
export default function getUser({ userId, token, force } = {}, onFinished) {
  return (dispatch, getState, { serviceContext } = {}) => {
    const user = getState().user.byId[userId] || {};
    const { loading, error } = user;

    if (!force) {
      if (loading === false && error === null) {
        return Promise.resolve(dispatch(GetUserSuccess({ fromCache: true })));
      }

      if (loading) {
        // There is ongoing request to get this user detail
        // Exit!
        return Promise.resolve();
      }
    }

    dispatch(GetUserInit({ userId, token, force }));

    const handleSuccess = user => dispatch(GetUserSuccess({ userId, user, token }));
    const handleError = error => dispatch(GetUserFail({ userId, error, token }));
    const _onFinished = () => onFinished && onFinished();

    const getUser = token
      ? UserService.getAuthenticatedUser(serviceContext, { token, userId })
      : UserService.getUser(serviceContext, { userId });

    getUser
      .then(handleSuccess, handleError)
      // Notify caller when API call successfully done
      .then(_onFinished);

    // Notify caller when API call fail and there's an error
    getUser.catch(_onFinished);

    return getUser;
  };
}

export function getUserByToken({ token, force }, onFinished) {
  const [header, payload, signature] = token.split('.');

  // Base64 decode unavailable on server-side
  // TODO: Decode to UTF8 (multibytes)
  const _atob =
    typeof atob === 'function' ? atob : payload => new Buffer(payload, 'base64').toString('ascii');

  const { 'user.uid': userId } = JSON.parse(_atob(payload));
  return getUser({ userId, token, force }, onFinished);
}
