import React, { Component } from 'react';
import { Label } from 'office-ui-fabric-react';
import { TextField } from 'office-ui-fabric-react';
import { PrimaryButton as Button } from 'office-ui-fabric-react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import { withFormik } from 'formik';
import { validate as isEmail } from 'isemail';
import style from './LoginForm.css';

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.$username = React.createRef();
  }

  componentDidMount() {
    this.$username.current && this.$username.current.focus();
  }

  handleChange = fieldName => value => this.props.setFieldValue(fieldName, value);

  render() {
    return (
      <div className="ms-Grid">
        <form onSubmit={this.props.handleSubmit} id="loginForm">
          <div className="ms-Grid-row">
            <TextField
              id="username"
              name="username"
              label="Email"
              placeholder="name@address.com"
              ref={this.$username}
              onChanged={this.handleChange('username')}
              required
              errorMessage={this.props.errors.username}
            />
          </div>

          <div className="ms-Grid-row password">
            <TextField
              id="password"
              name="password"
              label="Password"
              type="password"
              placeholder="password"
              onChanged={this.handleChange('password')}
              required
            />
          </div>

          <div className="ms-Grid-row">
            <Button
              type="submit"
              data-automation-id="sign-in-button"
              allowDisabledFocus
              disabled={this.props.isSubmitting}
              text="Sign in"
            />
            {this.props.isSubmitting && (
              <Spinner className="inline-loading" size={SpinnerSize.medium} />
            )}
            {this.props.errors &&
              this.props.errors.errorMessage && (
                <Label className="inline-error-message">{this.props.errors.errorMessage}</Label>
              )}
          </div>
        </form>
      </div>
    );
  }
}

LoginForm = withFormik({
  validateOnChange: false,
  mapPropsToValues: props => ({
    errorMessage: '',
  }),
  validate: (values) => {
    const errors = {};

    if (!isEmail(values.username)) {
      errors.username = 'Username should be a valid email address';
    }

    return errors;
  },
  handleSubmit: (credentials, { props, setSubmitting, setStatus, setFieldError }) => {
    const onSuccess = () => {
      setSubmitting(false);
      props.onAuthenticated && props.onAuthenticated();
    };

    const onError = () => {
      setSubmitting(false);
      setFieldError('errorMessage', 'Incorrect username and/or password. Please try again.');
    };

    setFieldError('errorMessage', '');
    setSubmitting(true);
    props.onAuthenticateUser(credentials).then(onSuccess, onError);
  },
})(LoginForm);

export default LoginForm;
