/**
 * Default 40X 50X response code error handler.
 * Can be overriden by client code.
 * Rethrows formatted errors.
 */
export const handleFailedRequest = (err) => {
  // By default, Axios wraps HTTP response body under 'data' property
  const { response } = err;
  const { data: responseBody } = response; // responseBody = err.response.data

  // GraphQL query and mutation always return data and errors fields
  const { errors } = responseBody || {}; // errors = err.response.data.errors

  if (errors && Array.isArray(errors)) {
    throw errors
      .map(error => error && error.message)
      .filter(errorMessage => errorMessage && errorMessage.trim && errorMessage.trim().length > 0);
  }

  throw err;
};

/**
 * Default 20X response code handler.
 * Can be overriden by client code.
 * Returns `response.data.data`
 */
export const handleSuccessfulRequest = (response = {}) => {
  // Axios wraps HTTP response body under 'data' property
  const { data: responseBody } = response; // responseBody = response.data

  // GraphQL query and mutation always return data (and errors) fields
  const { data } = responseBody || {}; // data = response.data.data

  return data;
};

export const request = (serviceContext = {}, options = {}) => {
  const { apiClient } = serviceContext;
  const {
    httpRequestOptions = null,
    query,
    variables,
    onSuccess = handleSuccessfulRequest,
    onError = handleFailedRequest,
  } = options;

  return apiClient
    .post(options.endPoint || '/graphql', { query, variables }, httpRequestOptions)
    .then(onSuccess, onError);
};

export const query = request;
export const mutate = request;

const GraphqlClient = {
  handleFailedRequest,
  handleSuccessfulRequest,
  query,
  mutate,
  request,
};

export default GraphqlClient;
