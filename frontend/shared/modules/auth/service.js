const Cookie = require('js-cookie');

function translateError({ response }) {
  const httpStatus = parseInt(response && response.status, 10);

  switch (httpStatus) {
    case 401:
      return 'Username or password not found';

    default:
      return 'Please try again later';
  }
}

function extractToken({ data }) {
  return data && data.data && data.data.token; // T_T
}

export function authenticateUser({ apiClient } = {}, sessionId, { username, password }) {
  return new Promise((resolve, reject) => {
    apiClient
      .post(`/auth/authenticate/${sessionId}`, { username, password })
      .then(payload => resolve(extractToken(payload)), err => reject(translateError(err)));
  });
}

export function validateToken({ apiClient } = {}, sessionId, { token }) {
  return new Promise((resolve, reject) => {
    const headers = { Authorization: `Bearer ${token}` };
    const validate = apiClient.get('/auth/token', { headers });
    validate.then(resolve, reject);
    validate.then(console.info(`Token validated ... ${token}`));
  });
}

/**
 * `persistToken` accept two parameters:
 *
 *   1) token: String, mandatory
 *   2) options: Object, optional, and may has `storage` field
 *
 * Cookie is used as default storage when `options.storage` is not defined.
 */
export function persistToken(serviceContext = {}, token, { storage = Cookie } = {}) {
  const { localStorage } = serviceContext;
  storage = localStorage || storage;

  return new Promise((resolve, reject) => {
    if (storage && storage.set) {
      const result = storage.set('token', token, { expires: 7 });

      if (result && result.then) {
        return result.then(resolve, reject);
      }

      return resolve();
    }

    return reject(new Error('Storage object should be supplied and provide `set` method'));
  });
}

/**
 * `getToken` accept:
 *
 *   1) options: an Object, optional, and may has `storage` and `synchronous` fields
 *
 * Cookie is used as default storage when `options.storage` is not defined.
 * Synchronous mode the default mode, meaning it will not return promise.
 */
export function getToken(serviceContext = {}, { synchronous = true, storage = Cookie } = {}) {
  const { localStorage } = serviceContext;
  storage = localStorage || storage;

  if (synchronous) {
    if (storage && storage.get) {
      return storage.get('token');
    }

    throw new Error('Storage object should be supplied and provide `get` method');
  }

  return new Promise((resolve, reject) => {
    if (storage && storage.get) {
      const result = storage.get('token');

      if (result && result.then) {
        return result.then(resolve, reject);
      }

      return resolve(result);
    }

    return reject(new Error('Storage object should be supplied and provide `get` method'));
  });
}

/**
 * `removeToken` accept:
 *
 *   1) options: an Object, optional, and may has `storage` and `synchronous` fields
 *
 * Cookie is used as default storage when `options.storage` is not defined.
 * Synchronous mode the default mode, meaning it will not return promise.
 */
export function removeToken(serviceContext = {}, { synchronous = true, storage = Cookie } = {}) {
  const { localStorage } = serviceContext;
  storage = localStorage || storage;

  if (synchronous) {
    if (storage && storage.remove) {
      return storage.remove('token');
    }

    throw new Error('Storage object should be supplied and provide `remove` method');
  }

  return new Promise((resolve, reject) => {
    if (storage && storage.remove) {
      const result = storage.remove('token');

      if (result && result.then) {
        return result.then(resolve, reject);
      }

      return resolve(result);
    }

    return reject(new Error('Storage object should be supplied and provide `remove` method'));
  });
}
