import React, { Component } from 'react';
import { Label } from 'office-ui-fabric-react/lib-commonjs/Label';
import { TextField } from 'office-ui-fabric-react/lib-commonjs/TextField';
import { PrimaryButton as Button } from 'office-ui-fabric-react/lib-commonjs/Button';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib-commonjs/Spinner';
import { withFormik } from 'formik';
import style from './UserDetailForm.css';

class UserDetailForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      saved: false,
    };
  }

  handleChange = fieldName => value => this.props.setFieldValue(fieldName, value);

  static getDerivedStateFromProps(props, state) {
    const { saved } = props.status || {};

    if (saved && saved != state.saved) {
      return {
        saved,
      };
    }

    return null;
  }

  render() {
    const { handleSubmit, values, isValid, isSubmitting } = this.props;

    return (
      <div className="ms-Grid" data-form-id="user-information">
        <div className="ms-Grid-row">
          <h2 className="ms-font-l">{this.props.title}</h2>

          {this.state.saved && <Label>{this.props.onSavedMessage}</Label>}

          {this.props.errors &&
            this.props.errors.errorMessage && (
              <Label className="inline-error-message">{this.props.errors.errorMessage}</Label>
            )}
        </div>

        <form onSubmit={handleSubmit} id="form">
          <div className="ms-Grid-row firstName">
            <TextField
              id="firstName"
              label="First name"
              type="text"
              placeholder="First name"
              required
              value={values.fName}
              onChanged={this.handleChange('fName')}
            />
          </div>

          <div className="ms-Grid-row lastName">
            <TextField
              id="lastName"
              label="Last name"
              type="text"
              placeholder="Last name"
              required
              value={values.lName}
              onChanged={this.handleChange('lName')}
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
              value={values.email}
              onChanged={this.handleChange('email')}
              autoComplete="off"
              // Leo: Commented for now because there's no API for it at the moment:
              // onGetErrorMessage={this.props.checkUsernameAvailability}
              // deferredValidationTime={1000} // Validation will start after users stop typing for 2 seconds
            />
          </div>

          {this.props.modify === 'create' && (
            <div className="ms-Grid-row password">
              <TextField
                id="password"
                label="Password"
                type="password"
                placeholder="Password"
                required
                value={values.password}
                onChanged={this.handleChange('password')}
                autoComplete="off"
              />
            </div>
          )}

          <div className="ms-Grid-row">
            <Button
              type="submit"
              data-automation-id="save-user-information-button"
              allowDisabledFocus
              disabled={isSubmitting}
              text="Save"
            />
            {isSubmitting && <Spinner className="loading" size={SpinnerSize.medium} />}
          </div>
        </form>
      </div>
    );
  }
}

UserDetailForm = withFormik({
  mapPropsToValues: (props) => {
    // Entity's fields
    const fields = ['fName', 'lName', 'phoneNumber', 'email', 'password'];

    const defaultValues = {
      userId: props.userId,
      errorMessage: '',
      fName: '',
      lName: '',
      phoneNumber: '',
      email: '',
      password: '',
    };

    const values = props.values || {};

    const passedValues = Object.keys(values)
      .filter(key => fields.indexOf(key) >= 0)
      .filter(key => values[key])
      .reduce((aggregator, key) => {
        aggregator[key] = values[key];
        return aggregator;
      }, {});

    return Object.assign({}, defaultValues, passedValues);
  },

  handleSubmit: (formValues, { setSubmitting, props, setStatus, setFieldError }) => {
    const onFinished = () => setSubmitting(false);

    const onError = (error) => {
      setFieldError(
        'errorMessage',
        `Error occurred while trying to ${props.modify} user. Please try again.`,
      );
      onFinished();
    };

    const onSuccess = (client) => {
      setStatus({ saved: true });
      onFinished();
    };

    setStatus({ saved: false });
    setSubmitting(true);
    props.onSubmit(formValues).then(onSuccess, onError);
  },
})(UserDetailForm);

export default UserDetailForm;
