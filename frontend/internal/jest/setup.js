// Polyfill 'requestAnimationFrame'
// See: https://reactjs.org/docs/javascript-environment-requirements.html
import 'raf/polyfill';

// Initialize Enzyme's Adapter for React 16
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });
