import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import { asyncConnect } from 'redux-connect';
import { DetailsList, DetailsListLayoutMode } from 'office-ui-fabric-react';
import qs from 'query-string';
import UserService from './UserService';
import Pager from '../../shared/utils/Pager';
import UserPanel from './UserPanel';

class UserListPage extends React.Component {
  columns = [
    {
      key: 'name',
      name: 'Name',
      fieldName: 'fullName',
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
    },
    {
      key: 'email',
      name: 'Email',
      fieldName: 'email',
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
    },
    {
      key: 'createdDate',
      name: 'Created Date',
      fieldName: 'createdDate',
      minWidth: 100,
      maxWidth: 200,
      isResizable: false,
    },
    {
      key: 'modifiedDate',
      name: 'Modified Date',
      fieldName: 'modifiedDate',
      minWidth: 100,
      maxWidth: 200,
      isResizable: false,
    },
  ];

  renderItemColumn = (item, index, column) => {
    const fieldContent = item[column.fieldName || ''];

    switch (column.key) {
      case 'name':
        return <Link to={`/users/${item.id}`}>{`${item.fName} ${item.lName}`}</Link>;

      case 'createdDate':
      case 'modifiedDate':
        if (fieldContent) {
          return <span>{new Date(fieldContent).toLocaleString('en-US')}</span>;
        }
        return null;

      default:
        return <span>{fieldContent}</span>;
    }
  };

  handleUserDetail = (user, index) => {
    this.props.history.push({ pathname: `/users/${user.id}` });
  };

  render() {
    if (!this.props.users) return null;

    const search = qs.parse(this.props.location.search);
    const page = parseInt(search.page, 10) || 1;
    const { users } = this.props || {};
    const { items = [], totalCount = 0, limit = {} } = users;
    const { first: perPage } = limit;

    return (
      <React.Fragment>
        <Helmet>
          <title>Users</title>
        </Helmet>

        <h2 className="ms-font-xl">Users</h2>

        {this.props.loading && <p>Loading...</p>}

        <Pager
          page={page}
          perPage={perPage}
          totalItems={totalCount}
          baseUrl="/users?page="
          onClick={(e, item) => {
            e.preventDefault();
            this.props.history.push(item.href);
          }}
        />

        <DetailsList
          items={items}
          columns={this.columns}
          setKey="set"
          layoutMode={DetailsListLayoutMode.fixedColumns}
          selectionPreservedOnEmptyClick
          compact={false}
          onRenderItemColumn={this.renderItemColumn}
          onItemInvoked={this.handleUserDetail}
        />

        <UserPanel />
      </React.Fragment>
    );
  }
}

// A route component may have data loader tasks to pre-populate data
// for server-side rendering purpose.
UserListPage = asyncConnect([
  {
    key: 'users',
    promise: ({ location, helpers }) => {
      const search = qs.parse(location.search);
      const page = parseInt(search.page, 10) || 1;
      console.log('Fetching users ...', { page });
      const options = { limit: { page } };
      return UserService.list(helpers.serviceContext, options);
    },
  },
])(UserListPage);

export default UserListPage;
