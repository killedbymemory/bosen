import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { Label } from 'office-ui-fabric-react';
import { Link } from 'react-router-dom';

const withSession = connect(state => ({ isAuthenticated: state.user.isAuthenticated }));

class ProtectedRoute extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirected: false,
      shouldRedirect: false,
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { isAuthenticated } = props;

    if (!isAuthenticated) {
      // Ensure we only render <Redirect /> once
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
    if (this.props.isAuthenticated) {
      return <Route {...this.props} />;
    }

    if (this.state.shouldRedirect) {
      return <Redirect to="/login" />;
    }

    return null;
  }
}

export default withSession(ProtectedRoute);
