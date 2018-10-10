import authenticateUser, { Types as UserAuthTypes } from './authenticateUser';
import deauthenticateUser, { Types as UserDeauthTypes } from './deauthenticateUser';
import getUser, { Types as GetUserTypes, getUserByToken } from './getUser';
import getUsers, { Types as GetUsersTypes } from './getUsers';
import changePassword, { Types as ChangePasswordTypes } from './changePassword';
import createUser, { Types as CreateUserTypes } from './createUser';

export const Types = {
  ...UserAuthTypes,
  ...GetUserTypes,
  ...GetUsersTypes,
  ...ChangePasswordTypes,
  ...UserDeauthTypes,
  ...CreateUserTypes,
};

export const Actions = {
  authenticateUser,
  deauthenticateUser,
  getUser,
  getUserByToken,
  getUsers,
  changePassword,
  createUser,
};

export default Actions;
