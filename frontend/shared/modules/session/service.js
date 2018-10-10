export function handleResult(resolve, result) {
  console.info(result.status, result.statusText, result.data);
  return resolve(result && result.data);
}

export function handleError(reject, err) {
  const response = (err && err.response) || {};
  const { status, statusText } = response;
  console.error(status, statusText);
  return reject(err);
}

export function createSession({ apiClient }, sessionId) {
  return new Promise((resolve, reject) => {
    apiClient
      .put(`/sessions/${sessionId}`, {})
      .then(handleResult.bind(null, resolve), handleError.bind(null, reject));
  });
}

export function renewSession({ apiClient }, sessionId) {
  return new Promise((resolve, reject) => {
    apiClient
      .post(`/sessions/${sessionId}`, {})
      .then(handleResult.bind(null, resolve), handleError.bind(null, reject));
  });
}
