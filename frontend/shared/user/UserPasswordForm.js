import React, { Component } from 'react';
import { Label } from 'office-ui-fabric-react';
import { TextField } from 'office-ui-fabric-react';
import { PrimaryButton as Button } from 'office-ui-fabric-react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import { withFormik } from 'formik';
import style from './UserPasswordForm.css';

class UserPasswordForm extends Component {
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
      <div className="ms-Grid">
        <div className="ms-Grid-row">
          <h2 className="ms-font-l">Change Password</h2>

          {this.state.saved && <Label>{this.props.onSavedMessage}</Label>}

          {this.props.errors &&
            this.props.errors.errorMessage && (
              <Label className="inline-error-message">{this.props.errors.errorMessage}</Label>
            )}
        </div>

        <form onSubmit={handleSubmit} id="user-password-form">
          {/*
          <div className="ms-Grid-row password old-password">
            <TextField
              id="oldPassword"
              label="Old Password"
              type="password"
              placeholder="Old password"
            />
          </div>
          */}

          <div className="ms-Grid-row password new-password">
            <TextField
              id="newPassword"
              label="New Password"
              type="password"
              placeholder="New password"
              required
              value={values.newPassword}
              onChanged={this.handleChange('newPassword')}
            />
          </div>

          {/*
          <div className="ms-Grid-row password new-password-confirmation">
            <TextField
              id="newPasswordConfirmation"
              label="New Password Confirmation"
              type="password"
              placeholder="New password confirmation"
            />
          </div>
          */}

          <div className="ms-Grid-row">
            <Button
              type="submit"
              data-automation-id="save-user-password-button"
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

UserPasswordForm = withFormik({
  mapPropsToValues: (props) => {
    const fields = ['oldPassword', 'newPassword', 'newPasswordConfirmation'];

    const defaultValues = {
      userId: props.userId,
      errorMessage: '',
      oldPassword: '',
      newPassword: '',
      newPasswordConfirmation: '',
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
        `Error occurred while trying to ${props.modify} password. Please try again.`,
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
})(UserPasswordForm);

export default UserPasswordForm;
