import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { CommandBar } from 'office-ui-fabric-react/lib-commonjs/CommandBar';

// See: https://github.com/OfficeDev/office-ui-fabric-react/wiki/Using-icons
import { initializeIcons } from 'office-ui-fabric-react/lib-commonjs/Icons';

initializeIcons();

import style from './TopNavigation.css';

const Navigation = (props) => {
  // console.log("Navigation", props);
  const navigationBar = navBar => navBar.type === Navigation.Bar;
  const regularNavigationBar = navBar => navBar.props && navBar.props.far === undefined;
  const farNavigationBar = navBar => navBar.props && navBar.props.far;
  const navigationItem = navigationItem => navigationItem.type === Navigation.Item;
  const toNavigationItem = navigationItem =>
    Navigation.Item({ ...navigationItem.props, key: navigationItem.key });

  const getNavigationItems = (navBar) => {
    const items = (navBar && Array.isArray(navBar.props.children) && navBar.props.children) || [
      navBar.props.children,
    ];
    return items.filter(navigationItem).map(toNavigationItem);
  };

  const navigationBars = (Array.isArray(props.children) && props.children) || [props.children];

  // <Navigation>
  //   <Navigation.Bar />
  // </Navigation>
  const navBar = navigationBars.filter(navigationBar).find(regularNavigationBar);

  // <Navigation>
  //   <Navigation.Bar far />
  // </Navigation>
  const farNavBar = navigationBars.filter(navigationBar).find(farNavigationBar);

  // <Navigation>
  //   <Navigation.Bar>
  //     <Navigation.Item key text cacheKey iconProps ...etc />
  //     <Navigation.Item key text cacheKey iconProps ...etc />
  //   <Navigation.Bar />
  // </Navigation>
  const items = navBar && getNavigationItems(navBar);
  const farItems = farNavBar && getNavigationItems(farNavBar);

  // console.info("Navigation items", items);
  return <CommandBar items={items} farItems={farItems} className="top-navigation" />;
};

Navigation.Bar = props =>
  // console.log("Navigation.Bar", props);
  props;

Navigation.Item = (props) => {
  // console.log("Navigation.Item", props);
  const { children, ...itemProps } = props;
  const subNavItems = (children && Array.isArray(children) && props.children) || [children];
  const subMenuProps = subNavItems
    .filter(navigationItem => navigationItem && navigationItem.type === Navigation.Item)
    .map(navigationItem => Navigation.Item({ ...navigationItem.props, key: navigationItem.key }));

  if (subMenuProps.length > 0) {
    return {
      ...itemProps,
      subMenuProps: {
        items: subMenuProps,
      },
    };
  }

  return {
    ...itemProps,
  };
};

const TopNavigation = ({ history, isAuthenticated, user }) => {
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Navigation>
      <Navigation.Bar>
        <Navigation.Item
          key="home"
          text="Home"
          cacheKey="homeKey"
          iconProps={{
            iconName: 'Home',
          }}
          href="/"
          onClick={(ev) => {
            ev.preventDefault();
            history.push('/');
            return true;
          }}
        />

        <Navigation.Item
          key="system"
          text="System"
          cacheKey="systemKey"
          iconProps={{
            iconName: 'System',
          }}
        >
          <Navigation.Item
            split
            key="users"
            text="Users"
            cacheKey="usersKey"
            iconProps={{
              iconName: 'People',
            }}
            // Combining 'href' and 'onClick' made the command item can be bookmarked
            // while still being handled by React Router:
            href="/users"
            onClick={(ev) => {
              ev.preventDefault();
              history.push('/users');
              return true;
            }}
          >
            <Navigation.Item
              key="addPeople"
              text="Create User"
              iconProps={{
                iconName: 'PeopleAdd',
              }}
              href="/users/new"
              onClick={(ev) => {
                ev.preventDefault();
                history.push('/users/new');
                return true;
              }}
            />
          </Navigation.Item>
        </Navigation.Item>
      </Navigation.Bar>

      <Navigation.Bar far>
        <Navigation.Item
          protected
          key="persona"
          text={isAuthenticated ? `${user.fName} ${user.lName}` : 'Guest'}
          cacheKey="personaKey"
          iconProps={{
            iconName: 'Contact',
          }}
          id="logged-in-user-button"
          data-section-label="persona-icon"
        >
          {!isAuthenticated && (
            <Navigation.Item
              key="login"
              text="Login"
              // Combining 'href' and 'onClick' made the command item can be bookmarked
              // while still being handled by React Router:
              href="/login"
              onClick={(ev) => {
                ev.preventDefault();
                history.push('/login');
                return true;
              }}
            />
          )}

          {isAuthenticated && (
            <Navigation.Item
              key="logout"
              text="Logout"
              iconProps={{
                iconName: 'OutOfOffice',
              }}
              // Combining 'href' and 'onClick' made the command item can be bookmarked
              // while still being handled by React Router:
              href="/logout"
              onClick={(ev) => {
                ev.preventDefault();
                history.push('/logout');
                return true;
              }}
              id="logout-button"
              data-section-label="logout-icon"
            />
          )}
        </Navigation.Item>
      </Navigation.Bar>
    </Navigation>
  );
};

const withSession = connect(state => ({
  isAuthenticated: state.user.isAuthenticated,
  user: state.user.authenticatedUser || {},
}));

export default withRouter(withSession(TopNavigation));
