import { Types as SessionActionTypes } from './action';

const initialState = {
  sessionId: null,
};

export default function reducers(state = {}, action) {
  switch (action.type) {
    case SessionActionTypes.SessionInit:
      return Object.assign({}, state, {
        sessionId: action.sessionId,
      });

    default:
      return state;
  }
}
