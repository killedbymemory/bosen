import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Label } from 'office-ui-fabric-react/lib-commonjs/Label';
import { TextField } from 'office-ui-fabric-react/lib-commonjs/TextField';
import { PrimaryButton as Button } from 'office-ui-fabric-react/lib-commonjs/Button';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib-commonjs/Spinner';
import { withFormik } from 'formik';
import style from './ChangePasswordForm.css';

class CreateUserForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      created: false,
    };
  }

  handleChange = fieldName => value => this.props.setFieldValue(fieldName, value);

  componentDidUpdate = (prevProps, prevState) => {
    const loaded = prevProps.loading === true && this.props.loading === false;
    const created = this.state.created;
    const { _errors } = this.props;
    const hasError = _errors && Array.isArray(_errors) && _errors.length > 0;

    if (loaded && !hasError && !created) {
      this.setState(() => ({ created: true }));
    }
  };

  render() {
    const { values, isValid, isSubmitting, _errors } = this.props;

    return (
      <div className="ms-Grid">
        <div className="ms-Grid-row">
          <h2 className="ms-font-l">Create User</h2>
          {this.state.created && <Label>User successfully created</Label>}
          {this.props._errors &&
            Array.isArray(this.props._errors) &&
            this.props._errors.map((errorMessage, i) => <Label key={i}>{errorMessage}</Label>)}
          {isSubmitting && <Label>Loading...</Label>}
        </div>

        <form onSubmit={this.props.handleSubmit} id="userInformationForm">
          <div className="ms-Grid-row firstName">
            <TextField
              id="firstName"
              label="First name"
              type="text"
              placeholder="First name"
              required
              value={values.firstName}
              onChanged={this.handleChange('firstName')}
            />
          </div>

          <div className="ms-Grid-row lastName">
            <TextField
              id="lastName"
              label="Last name"
              type="text"
              placeholder="Last name"
              required
              value={values.lastName}
              onChanged={this.handleChange('lastName')}
            />
          </div>

          <div className="ms-Grid-row phoneNumber">
            <TextField
              id="phoneNumber"
              label="Phone Number"
              type="text"
              placeholder="Phone number"
              required
              value={values.phoneNumber}
              onChanged={this.handleChange('phoneNumber')}
            />
          </div>

          <div className="ms-Grid-row username">
            <TextField
              id="username"
              label="Email address"
              type="text"
              placeholder="name@domain.com"
              required
              value={values.username}
              onChanged={this.handleChange('username')}
              deferredValidationTime={1000} // Validation will start after users stop typing for 2 seconds
              // Leo: Commented for now because there's no API for it at the moment:
              // onGetErrorMessage={this.props.checkUsernameAvailability}
            />
          </div>

          <div className="ms-Grid-row password">
            <TextField
              id="password"
              label="Password"
              type="password"
              placeholder="Password"
              required
              value={values.password}
              onChanged={this.handleChange('password')}
            />
          </div>

          <div className="ms-Grid-row">
            <Button
              type="submit"
              data-automation-id="create-user-button"
              allowDisabledFocus
              disabled={isSubmitting}
              text="Create User"
            />
            {isSubmitting && <Spinner className="create-user-loading" size={SpinnerSize.medium} />}
          </div>
        </form>
      </div>
    );
  }
}

CreateUserForm = withFormik({
  mapPropsToValues: props => ({
    userId: props.userId,
  }),

  handleSubmit: (formValues, { setSubmitting, props }) => {
    setSubmitting(true);
    const onFinished = () => setSubmitting(false);
    props.onSubmit(formValues, onFinished);
  },
})(CreateUserForm);

CreateUserForm = connect((state, props) => {
  const userId = props.userId;
  const user = state.user.byId[userId] || {};
  const { loading, error } = user;
  return { ...props, user, loading, _errors: error, userId };
})(CreateUserForm);

export default CreateUserForm;
