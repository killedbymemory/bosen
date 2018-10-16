import GraphqlClient from '../../shared/graphql/client';

function handleError(error = {}) {
  const { response } = error;
  const { status } = response || {};
  const httpStatus = parseInt(status, 10);

  switch (httpStatus) {
    case 400:
      const errorMessage = (response.data && response.data.message) || '400: No error message';
      return errorMessage;
      break;
    case 401:
      return 'Old password is wrong.';
      break;
    default:
      console.error(error);
      return 'Please try again later';
  }
}

export function list(serviceContext = {}, { limit = {} } = {}) {
  const { page = 1, perPage = 10 } = limit;
  const _perPage = perPage > 0 ? perPage : 10;
  const _page = page > 0 ? page : 1;
  const offset = (_page - 1) * perPage;
  const first = perPage;

  const query = `
    query GetPeople($limit: Limit) {
      people(limit: $limit) {
        totalCount
        hasNextPage
        limit {
          first
          offset
        }
        items {
          id
          firstName
          lastName
          email
          createdDate
          modifiedDate
        }
      }
    }
  `;

  const variables = {
    limit: {
      first,
      offset,
    },
  };

  const queryOptions = {
    query,
    variables,
  };

  const extractUsers = (payload = {}) => payload.people || {};
  return GraphqlClient.query(serviceContext, queryOptions).then(extractUsers);
}

export function getAuthenticatedUser(serviceContext = {}, { userId, token } = {}) {
  const { apiClient } = serviceContext;
  const headers = { Authorization: `Bearer ${token}` };

  const extractUser = (response = {}) => {
    // Axios wraps HTTP response body under 'data' property
    const { data } = response;
    return data || {};
  };

  return apiClient.get(`/users/${userId}`, { headers }).then(extractUser, handleError);
}

export function getUser(serviceContext = {}, { userId, token } = {}) {
  const { apiClient } = serviceContext;

  const query = `
    query PersonDetail($personId: String!) {
      person(id: $personId) {
        id
        firstName
        lastName
        email
        createdDate
      }
    }
  `;

  const variables = {
    personId: userId,
  };

  const httpRequestOptions = token && {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const queryOptions = {
    httpRequestOptions,
    query,
    variables,
  };

  return GraphqlClient.query(serviceContext, queryOptions).then(
    payload => payload && payload.person,
  );
}

export function changePassword(serviceContext = {}, userId, passwords = {}) {
  const { apiClient } = serviceContext;
  const { newPassword, oldPassword } = passwords;

  // Handle 40X 50X response code
  const onFailedRequest = (err) => {
    // Axios wraps HTTP response body under 'data' property
    const { response } = err;
    const { data: responseBody } = response;

    // Rest API and GraphQL query and mutation always return data and errors fields
    const { succeeded, errors } = responseBody || {};

    if (!succeeded && errors && Array.isArray(errors)) {
      throw errors
        .map(error => error && error.message)
        .filter(
          errorMessage => errorMessage && errorMessage.trim && errorMessage.trim().length > 0,
        );
    }

    throw err;
  };

  // Handle 20X response code
  const onSuccessfulRequest = (response = {}) => {
    // Axios wraps HTTP response body under 'data' property
    const { data: responseBody } = response;

    // Rest API and GraphQL query and mutation always return data and errors fields
    const { succeeded } = responseBody || {};

    return succeeded;
  };

  return new Promise((resolve, reject) => {
    apiClient
      .post('/api/account/changepassword', { email: userId, password: newPassword })
      .then(onSuccessfulRequest, onFailedRequest)
      .then(resolve, reject);
  });
}

export function create(serviceContext = {}, userId, userInformation = {}) {
  const { firstName, lastName, email, password } = userInformation;

  const query = `
    mutation AddNewPerson($person: PersonAdd!) {
      addPerson(person: $person) {
        id
      }
    }
  `;

  const variables = {
    person: {
      id: userId,
      firstName,
      lastName,
      phoneNumber,
      email,
      password, // Placeholder only since it is generated on API-side
    },
  };

  const queryOptions = {
    query,
    variables,
  };

  return GraphqlClient.query(serviceContext, queryOptions).then(
    payload => payload && payload.addPerson,
  );
}

export function update(serviceContext = {}, userId, userInformation = {}) {
  const { firstName, lastName, phoneNumber, email } = userInformation;

  const query = `
    mutation UpdatePerson($userId: String!, $person: PersonUpdate!) {
      updatePerson(id: $userId, person: $person) {
        id
      }
    }
  `;

  const variables = {
    userId,
    person: {
      firstName,
      lastName,
      email,
    },
  };

  const queryOptions = {
    query,
    variables,
  };

  return GraphqlClient.query(serviceContext, queryOptions).then(
    payload => payload && payload.updatePerson,
  );
}

export default {
  list,
  getAuthenticatedUser,
  getUser,
  changePassword,
  create,
  update,
};
