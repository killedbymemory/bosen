import uuid from 'uuid';
import cookie from 'cookie';
import * as SessionService from '../../shared/modules/session/service';

function createSession(serviceContext) {
  const sessionId = uuid.v4();
  console.log('Creating new session id', sessionId);
  return SessionService.createSession(serviceContext, sessionId);
}

function renewSession(serviceContext, sessionId) {
  console.log('Renewing session id', sessionId);
  return SessionService.renewSession(serviceContext, sessionId);
}

function persistSessionId(req, res, { uid } = {}) {
  console.log('Persist sessionId in cookie', uid);
  const sessionId = String(uid);
  req.cookies.sessionId = sessionId;
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('sessionId', sessionId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
    }),
  );
}

export default (req, res, next) => {
  const { serviceContext } = req;

  const renewSessionFlow = (serviceContext, sessionId) =>
    new Promise((resolve, reject) => {
      renewSession(serviceContext, sessionId).then(
        (result) => {
          console.log('Session id %s renewed', sessionId);
          resolve(result);
        },

        (err) => {
          const response = (err && err.response) || {};
          const statusCode = response.status;

          switch (statusCode) {
            case 404:
              console.info('Session id %s not found', sessionId);

              // Create new one
              const handleSuccess = (result) => {
                const { uid } = result;
                console.info('Session id %s created', uid);
                return resolve(result);
              };

              createSession(serviceContext).then(handleSuccess, reject);
              break;

            default:
              console.error('SessionMiddleware.renewSessionFlow unhandled status code');
              reject(err);
          }
        },
      );
    });

  let task;

  switch (true) {
    case req.cookies && !!req.cookies.sessionId:
      const sessionId = req.cookies.sessionId;
      console.info('Session id found in cookie', sessionId);
      task = renewSessionFlow(serviceContext, sessionId);
      break;
    default:
      task = createSession(serviceContext);
      break;
  }

  // Create or renew session then persist it in cookie
  task
    .then(persistSessionId.bind(null, req, res))
    .catch(err => console.error('Task error handler', err, err.stack))
    .then(next);
};
