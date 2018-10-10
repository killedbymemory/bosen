import { createAction } from 'redux-actions';
import UserService from '../UserService';

const GetUsersInit = createAction('GetUsersInit', payload => ({
  ...payload,
  loading: true,
  error: null,
}));

const GetUsersSuccess = createAction('GetUsersSuccess', payload => ({
  ...payload,
  loading: false,
}));

const GetUsersFail = createAction('GetUsersFail', payload => ({ ...payload, loading: false }));

export const Types = {
  GetUsersInit,
  GetUsersFail,
  GetUsersSuccess,
};

export default function getUsers({ onFinished, limit = {} } = {}) {
  return (dispatch, getState, { serviceContext } = {}) => {
    const { loading } = getState().user;

    if (loading) {
      // There is ongoing user-related operation. Exit!
      return Promise.resolve();
    }

    dispatch(GetUsersInit());

    if (getState().user.collection.length > 0) {
      dispatch(GetUsersSuccess());
      return Promise.resolve();
    }

    const handleSuccess = users => dispatch(GetUsersSuccess({ users }));
    const handleError = error => dispatch(GetUsersFail({ error }));
    const _onFinished = () => onFinished && onFinished();
    const getUsers = UserService.getUsers(serviceContext, { limit });

    getUsers
      .then(handleSuccess, handleError)
      // Notify caller when API call successfully done
      .then(_onFinished);

    // Notify caller when API call fail and there's an error
    getUsers.catch(_onFinished);

    return getUsers;
  };
}
