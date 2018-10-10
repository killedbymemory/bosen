import { handleActions, combineActions } from 'redux-actions';
import update from 'immutability-helper';
import { Types as UserActionTypes } from './actions';

const {
  // User Authentication
  UserAuthInit,
  UserAuthSuccess,
  UserAuthFail,

  // User Deauthentication
  UserDeauthInit,
  UserDeauthSuccess,
  UserDeauthFail,

  // Get Users
  GetUsersInit,
  GetUsersSuccess,
  GetUsersFail,

  // Get User Detail
  GetUserInit,
  GetUserSuccess,
  GetUserFail,

  // Change User Password
  ChangePasswordInit,
  ChangePasswordFail,
  ChangePasswordSuccess,

  // Change User Password
  CreateUserInit,
  CreateUserFail,
  CreateUserSuccess,
} = UserActionTypes;

const initialState = {
  loading: false,
  error: null,
  sessionId: null,
  isAuthenticated: false,
  authenticatedUser: {},
  collection: [],
  byId: {},
};

const reducers = {
  [combineActions(UserAuthInit, UserAuthFail)]: (state, action) => {
    const { error, loading, isAuthenticated, user = {} } = action.payload;
    return Object.assign({}, state, { error, loading, isAuthenticated, authenticatedUser: user });
  },

  [combineActions(UserAuthSuccess, UserDeauthSuccess)]: (state, action) => {
    const { loading, isAuthenticated, user = {} } = action.payload;
    return Object.assign({}, state, {
      loading,
      isAuthenticated,
      authenticatedUser: user,
    });
  },

  [combineActions(GetUsersInit, GetUsersFail, UserDeauthInit, UserDeauthFail)]: (state, action) => {
    const { error, loading } = action.payload;
    return Object.assign({}, state, { error, loading });
  },

  [combineActions(GetUsersSuccess)]: (state, action) => {
    const { loading, users } = action.payload;
    return Object.assign({}, state, {
      loading,
      collection: users || state.collection,
    });
  },

  [combineActions(GetUserInit, GetUserFail, CreateUserInit, CreateUserFail)]: (state, action) => {
    const { error, loading, userId } = action.payload;
    return update(state, {
      byId: {
        [userId]: {
          $apply: state => Object.assign({}, state, { error, loading }),
        },
      },
    });
  },

  [combineActions(GetUserSuccess, CreateUserSuccess)]: (state, action) => {
    const { loading, userId, user } = action.payload;

    if (!userId) return state;

    return update(state, {
      byId: {
        [userId]: {
          $apply: state => Object.assign({}, state, { loading }, user),
        },
      },
    });
  },

  [combineActions(ChangePasswordInit, ChangePasswordFail)]: (state, action) => {
    const { error, loading, userId } = action.payload;
    return update(state, {
      byId: {
        [userId]: {
          $apply: state =>
            Object.assign({}, state, {
              error,
              password: {
                loading,
              },
            }),
        },
      },
    });
  },

  [combineActions(ChangePasswordSuccess)]: (state, action) => {
    const { loading, userId } = action.payload;

    if (!userId) return state;

    return update(state, {
      byId: {
        [userId]: {
          $apply: state =>
            Object.assign({}, state, {
              loading,
              password: {
                loading,
              },
            }),
        },
      },
    });
  },
};

export default handleActions(reducers, initialState);
