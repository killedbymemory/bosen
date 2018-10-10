/* eslint-disable react/no-unescaped-entities */
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { Actions as UserActions } from '../../shared/user/actions';
import LoginForm from './LoginForm';

class LoginPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      redirected: false,
      shouldRedirect: false,
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { authenticated } = props;

    if (authenticated) {
      // To ensure we only render <Redirect /> once, only redirect user
      // once they're authenticated and have not redirected yet.
      let shouldRedirect = false;
      let redirected = state.redirected;

      if (!redirected) {
        redirected = true;
        shouldRedirect = true;
      }

      return {
        redirected,
        shouldRedirect,
      };
    }

    return null;
  }

  render() {
    if (this.state.shouldRedirect) {
      return <Redirect to={{ pathname: '/' }} />;
    }

    return (
      <div style={{ margin: '100px auto 0 auto', width: '500px' }} data-screen-id="login">
        <h1 className="ms-font-xxl">Login</h1>
        <LoginForm
          onAuthenticateUser={credentials =>
            this.props.dispatch(UserActions.authenticateUser(credentials))
          }
        />
      </div>
    );
  }
}

LoginPage = connect(state => ({ authenticated: state.user.isAuthenticated }))(LoginPage);

export default LoginPage;
