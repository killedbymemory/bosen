import * as SessionService from './service';

const SessionInit = 'Session::UserSession::Init';

export const Types = {
  SessionInit,
};

export function initSessionIdFromCookie(sessionId) {
  return {
    type: SessionInit,
    sessionId,
  };
}
