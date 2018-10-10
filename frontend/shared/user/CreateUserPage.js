import React from 'react';
import Helmet from 'react-helmet';
import UserService from './UserService';
import UserDetailForm from './UserDetailForm';
import { withServiceContext } from '../../shared/serviceContext';
import { validate as isEmail } from 'isemail';

class CreateUserPage extends React.Component {
  constructor(props) {
    super(props);
  }

  checkUsernameAvailability = (username) => {
    if (!isEmail(username)) {
      return;
    }

    return new Promise((resolve) => {
      const getUser = UserService.getUser(this.props.serviceContext, { userId: username });
      const handleFound = user =>
        user && resolve('Email is already registered. Please choose another one.');
      const handleNotFound = () => resolve();
      getUser.then(handleFound, handleNotFound);
    });
  };

  handleCreateUser = (formValues, { onSuccess, onError } = {}) => {
    const { userId, ...userInformation } = formValues;
    return UserService.create(this.props.serviceContext, userId, userInformation);
  };

  render() {
    const { match } = this.props;
    const userId = match && match.params && match.params.id;

    return (
      <React.Fragment>
        <Helmet>
          <title>Create User</title>
        </Helmet>

        <UserDetailForm
          modify="create"
          title="Create User Information"
          onSavedMessage="User successfully created"
          userId={userId}
          onSubmit={this.handleCreateUser}
        />
      </React.Fragment>
    );
  }
}

export default withServiceContext(CreateUserPage);
