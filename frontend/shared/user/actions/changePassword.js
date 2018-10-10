import { createAction } from 'redux-actions';
import UserService from '../UserService';

const ChangePasswordInit = createAction('ChangePasswordInit', payload => ({
  ...payload,
  loading: true,
  error: null,
}));

const ChangePasswordSuccess = createAction('ChangePasswordSuccess', payload => ({
  ...payload,
  loading: false,
}));

const ChangePasswordFail = createAction('ChangePasswordFail', payload => ({
  ...payload,
  loading: false,
}));

export const Types = {
  ChangePasswordInit,
  ChangePasswordFail,
  ChangePasswordSuccess,
};

export default function changePassword(userId, passwords = {}, onFinished) {
  return (dispatch, getState, { serviceContext } = {}) => {
    const user = getState().user.byId[userId] || {};
    const { email, loading, error } = user;

    if (loading) {
      // There is ongoing request to change this user password. Exit!
      return Promise.resolve();
    }

    dispatch(ChangePasswordInit({ userId, passwords }));

    const handleSuccess = () => dispatch(ChangePasswordSuccess({ userId }));
    const handleError = error => dispatch(ChangePasswordFail({ userId, error }));
    const _onFinished = () => onFinished && onFinished();
    const changePassword = UserService.changePassword(serviceContext, { userId: email, passwords });

    changePassword
      .then(handleSuccess, handleError)
      // Notify caller when API call successfully done
      .then(_onFinished);

    // Notify caller when API call fail and there's an error
    changePassword.catch(_onFinished);

    return changePassword;
  };
}
