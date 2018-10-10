import { asyncComponent } from 'react-async-component';
import { configureLoadStyles } from '@microsoft/load-themed-styles';

// Push styles into variables for injecting later.
// No op, for now.
configureLoadStyles(x => x);

export default asyncComponent({
  // This is the trick to be able to get Office UI Fabric React works on server side.
  // Without this, we can't have server-side rendered Fabric page.
  // The trick is to load Application asynchronously so it wont be processed (or, required) directly when booting server side code.
  // Only when it's rendered then it will be required and at that point we have access to `configureLoadStyles` above to
  // modify its behaviour to support server-side rendering.
  resolve: () => System.import(/* webpackChunkName: "main" */ '../Application/index'),
});
