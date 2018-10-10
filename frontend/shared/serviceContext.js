import React from 'react';

export const ServiceContext = React.createContext({});

export const withServiceContext = Component => props => (
  <ServiceContext.Consumer>
    {serviceContext => <Component {...props} serviceContext={serviceContext} />}
  </ServiceContext.Consumer>
);
