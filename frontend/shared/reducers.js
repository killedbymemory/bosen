import { combineReducers } from 'redux';
import session from './modules/session/reducer';
import user from './user/userReducer';

const reducers = {
  session,
  user,
};

export default reducers;
