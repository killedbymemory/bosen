import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import uuid from 'uuid';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import Error404 from '../shared/components/Application/Error404';
import AsyncHomeRoute from '../shared/components/Application/AsyncHomeRoute';
import UserListPage from '../shared/user/UserListPage';
import UserDetailPage from '../shared/user/UserDetailPage';
import CreateUserPage from '../shared/user/CreateUserPage';
import LoginPage from '../shared/app/LoginPage';
import LogoutPage from '../shared/app/LogoutPage';

/**
 * Plain route configurations are required in order to be decorated by redux-connect
 * to support server-side rendering. redux-connect will figure out components
 * used on certain route path and then preload data required by that components.
 * Plain route configurations are mainly used on server-side.
 */
const routes = [
  { path: '/', exact: true, component: AsyncHomeRoute, id: 'home', protected: true },

  // Users
  {
    path: '/users/new/:id',
    exact: true,
    component: CreateUserPage,
    id: 'create-user',
    protected: true,
  },
  {
    path: '/users/new',
    render: () => <Redirect to={{ pathname: `/users/new/${uuid.v4()}` }} />,
    id: 'create-user-without-id',
    protected: true,
  },
  {
    path: '/users',
    component: UserListPage,
    id: 'users',
    protected: true,
  },
  { path: '/users/:id', exact: true, component: UserDetailPage, id: 'user', protected: true },

  { path: '/logout', component: LogoutPage, id: 'logout' },
  { path: '/login', component: LoginPage, id: 'login' },
  { component: Error404, id: '404' },
];

/**
 * Map route configurations to either <Route> or <ProtectedRoute> based
 * on their property. This can be used on either client or server side.
 */
export const Routes = routes.map((route) => {
  if (route.protected) {
    return <ProtectedRoute key={route.id} {...route} />;
  }

  return <Route key={route.id} {...route} />;
});

export default routes;
