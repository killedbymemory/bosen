import React from 'react';
import { Route } from 'react-router-dom';
import { Panel, PanelType } from 'office-ui-fabric-react';
import UserDetailPage from './UserDetailPage';

const UserPanel = () => (
  <Route
    path="/users/:id"
    exact
    render={props => (
      <Panel
        hasCloseButton={false}
        type={PanelType.medium}
        isOpen
        isLightDismiss
        onLightDismissClick={() => props.history.push('/users')}
      >
        <UserDetailPage {...props} />
      </Panel>
    )}
  />
);

export default UserPanel;
