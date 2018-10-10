import { createAction } from 'redux-actions';
import UserService from '../UserService';

const CreateUserInit = createAction('CreateUserInit', payload => ({
  ...payload,
  loading: true,
  error: null,
}));

const CreateUserSuccess = createAction('CreateUserSuccess', payload => ({
  ...payload,
  loading: false,
}));

const CreateUserFail = createAction('CreateUserFail', payload => ({ ...payload, loading: false }));

export const Types = {
  CreateUserInit,
  CreateUserFail,
  CreateUserSuccess,
};

export default function createUser(formValues = {}, onFinished) {
  return (dispatch, getState, { serviceContext } = {}) => {
    const { userId, ...userInformation } = formValues;
    const user = getState().user.byId[userId] || {};
    const { loading, error } = user;

    if (loading) {
      // There is ongoing request to create this user
      // Exit!
      return Promise.resolve();
    }

    dispatch(CreateUserInit({ userId, userInformation }));

    const handleSuccess = user => dispatch(CreateUserSuccess({ userId, user }));
    const handleError = error => dispatch(CreateUserFail({ userId, error }));
    const _onFinished = () => onFinished && onFinished();
    const _createUser = UserService.createUser(serviceContext, userId, userInformation);

    _createUser
      .then(handleSuccess, handleError)
      // Notify caller when API call successfully done
      .then(_onFinished);

    // Notify caller when API call fail and there's an error
    _createUser.catch(_onFinished);

    return _createUser;
  };
}
