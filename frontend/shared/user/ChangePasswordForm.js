import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Label } from 'office-ui-fabric-react/lib-commonjs/Label';
import { TextField } from 'office-ui-fabric-react/lib-commonjs/TextField';
import style from './ChangePasswordForm.css';

class ChangePasswordForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      updated: false,
    };

    this.$oldPassword = React.createRef();
    this.$newPassword = React.createRef();
    this.$newPasswordConfirmation = React.createRef();
  }

  handleSubmit = (event) => {
    // Prevent browser's default browser from handling form submission
    event.preventDefault();
    this.setState(() => ({ updated: false }));
    this.props.onSubmit({
      // oldPassword: this.$oldPassword.current.value,
      newPassword: this.$newPassword.current.value,
      // newPasswordConfirmation: this.$newPasswordConfirmation.current.value,
    });
  };

  componentDidUpdate = (prevProps, prevState) => {
    const loaded = prevProps.loading === true && this.props.loading === false;
    const updated = this.state.updated;
    const { errors } = this.props;
    const hasError = errors && Array.isArray(errors) && errors.length > 0;

    if (loaded && !hasError && !updated) {
      this.setState(() => ({ updated: true }));
    }
  };

  render() {
    return (
      <div className="ms-Grid">
        <div className="ms-Grid-row">
          <h2 className="ms-font-l">Change Password</h2>
          {this.props.loading && <Label>Loading...</Label>}
          {this.props.errors &&
            Array.isArray(this.props.errors) &&
            this.props.errors.map((errorMessage, i) => <Label key={i}>{errorMessage}</Label>)}
          {this.state.updated && <Label>Password successfully saved</Label>}
        </div>

        <form onSubmit={this.handleSubmit} id="userInformationForm">
          {/*
          <div className="ms-Grid-row password old-password">
            <TextField
              id="oldPassword"
              label="Old Password"
              type="password"
              placeholder="Old password"
              ref={this.$oldPassword}
            />
          </div>
          */}

          <div className="ms-Grid-row password new-password">
            <TextField
              id="newPassword"
              label="New Password"
              type="password"
              placeholder="New password"
              ref={this.$newPassword}
              required
            />
          </div>

          {/*
          <div className="ms-Grid-row password new-password-confirmation">
            <TextField
              id="newPasswordConfirmation"
              label="New Password Confirmation"
              type="password"
              placeholder="New password confirmation"
              ref={this.$newPasswordConfirmation}
            />
          </div>
          */}

          <div className="ms-Grid-row">
            <TextField type="submit" value="Submit" disabled={this.props.loading} />
          </div>
        </form>
      </div>
    );
  }
}

ChangePasswordForm = connect((state, props) => {
  const userId = props.userId;
  const user = state.user.byId[userId] || {};
  const { password, error } = user;
  const { loading } = password || {};
  return { ...props, loading, errors: error };
})(ChangePasswordForm);

export default ChangePasswordForm;
