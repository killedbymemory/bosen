import React from 'react';
import Helmet from 'react-helmet';
import { asyncConnect } from 'redux-connect';
import { Icon } from 'office-ui-fabric-react/lib-commonjs/Icon';
import { Label } from 'office-ui-fabric-react/lib-commonjs/Label';
import { withServiceContext } from '../../shared/serviceContext';
import UserService from './UserService';
import UserPasswordForm from './UserPasswordForm';
import UserDetailForm from './UserDetailForm';

class UserDetailPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
    };

    this._asyncRequests = {};
  }

  handleChangePassword = (formValues, { onSuccess, onError } = {}) => {
    const { userId, ...passwords } = formValues;
    return UserService.changePassword(this.props.serviceContext, userId, passwords);
  };

  handleUpdateUser = (formValues, { onSuccess, onError } = {}) => {
    const { userId, ...userInformation } = formValues;
    return UserService.update(this.props.serviceContext, userId, userInformation);
  };

  getUserDetail = () => {
    const { match } = this.props;
    const userId = match && match.params && match.params.id;
    return (this._asyncRequests.getUserDetail = UserService.getUser(this.props.serviceContext, {
      userId,
    }).then((user) => {
      this._asyncRequests.getUserDetail = null;
      this.setState({ user });
    }));
  };

  componentDidMount() {
    this.getUserDetail();
  }

  componentWillUnmount() {
    Object.keys(this._asyncRequests).forEach((asyncRequest) => {
      asyncRequest && asyncRequest.cancel && asyncRequest.cancel();
    });
  }

  render() {
    const { match } = this.props;
    const userId = match && match.params && match.params.id;
    const { user } = this.state;

    if (!user) {
      return (
        <Label as="h2" className="ms-font-l" style={{ textTransform: 'capitalize' }}>
          Loading...
        </Label>
      );
    }

    return (
      <div data-screen-id="user-detail">
        <Helmet>
          <title>{`${user.fName} ${user.lName}`} - User Detail</title>
        </Helmet>

        <h2 className="ms-font-xl">
          <Icon iconName="Contact" /> {`${user.fName} ${user.lName}`}
        </h2>

        <UserDetailForm
          modify="update"
          title="Edit User Information"
          onSavedMessage="User successfully updated"
          userId={userId}
          onSubmit={this.handleUpdateUser}
          values={user}
        />

        <UserPasswordForm
          modify="update"
          userId={user.email}
          onSavedMessage="Password successfully updated"
          onSubmit={this.handleChangePassword}
        />
      </div>
    );
  }
}

// A route component may have data loader tasks to pre-populate data
// for server-side rendering purpose.
UserDetailPage = asyncConnect([
  {
    key: 'user',
    promise: ({ match, helpers }) => {
      const userId = match && match.params && match.params.id;
      return UserService.getUser(helpers.serviceContext, { userId });
    },
  },
])(withServiceContext(UserDetailPage));

export default UserDetailPage;
