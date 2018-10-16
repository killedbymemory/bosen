import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'office-ui-fabric-react';
import style from './Pager.css';

export default class Pager extends React.Component {
  render() {
    const { page, perPage, totalItems, baseUrl, onClick } = this.props;
    const prevPage = page - 1;
    const nextPage = page + 1;
    const lastPage = Math.ceil(totalItems / perPage);

    const items = [
      { text: 'First', key: 'first' },
      { text: 'Prev', key: 'previous' },
      { text: 'Next', key: 'next' },
      { text: 'Last', key: 'last' },
    ].map((item) => {
      item.onClick = onClick;

      switch (item.key) {
        case 'first':
          item.href = [baseUrl, 1].join('');
          if (page === 1) {
            delete item.href;
            delete item.onClick;
          }
          break;

        case 'previous':
          item.href = [baseUrl, prevPage].join('');
          if (prevPage < 1) {
            delete item.href;
            delete item.onClick;
          }
          break;

        case 'next':
          item.href = [baseUrl, nextPage].join('');
          if (nextPage > lastPage) {
            delete item.href;
            delete item.onClick;
          }
          break;

        case 'last':
          item.href = [baseUrl, lastPage].join('');
          if (lastPage == 0 || page === lastPage) {
            delete item.href;
            delete item.onClick;
          }
          break;
      }

      return item;
    });

    return (
      <Breadcrumb
        className="pager"
        items={items}
        dividerAs={() => <span>&bull;</span>}
        onRenderItem={(item, renderItemFn) => {
          const renderedItem = renderItemFn(item);

          if (!item.href) {
            return <div className="pager-item disabled">{renderedItem}</div>;
          }

          return renderedItem;
        }}
      />
    );
  }
}
