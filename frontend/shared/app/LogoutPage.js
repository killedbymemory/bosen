/* eslint-disable react/no-unescaped-entities */
import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Actions as UserActions } from '../../shared/user/actions';
import { asyncConnect } from 'redux-connect';

class Logout extends Component {
  render() {
    return (
      <div style={{ margin: '100px auto 0 auto', width: '500px' }}>
        <h1 className="ms-font-xxl">You are successfully logged out.</h1>
        <Link to="/login">Click here to log in.</Link>
      </div>
    );
  }
}

Logout = asyncConnect([
  {
    key: 'DeauthenticateUser',
    promise: ({ match, store, helpers } = {}) => {
      const { isAuthenticated } = store.getState().user;

      if (isAuthenticated) {
        return store.dispatch(UserActions.deauthenticateUser());
      }

      return Promise.resolve();
    },
  },
])(Logout);

export default Logout;
