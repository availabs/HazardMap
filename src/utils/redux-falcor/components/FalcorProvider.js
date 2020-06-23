import { Component, Children } from 'react';
import PropTypes from 'prop-types';
// import expandCache from './ExpandCache';

import createStore from './createStore';

// function debounce(func, wait) {
//   let timeout;
//   return function doDebounce() {
//     const context = this;
//     const args = arguments;
//     const later = () => {
//       timeout = null;
//       func.apply(context, args);
//     };
//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//   };
// }

function attachOnChange(falcor, store) {
  falcor.onChange(this, () => store.trigger(falcor.getCache()));
}

export default class FalcorProvider extends Component {
  static propTypes = {
    falcor: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    children: PropTypes.element.isRequired,
  };

  static childContextTypes = {
    falcor: PropTypes.object.isRequired,
    falcorStore: PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.falcor = props.falcor;
    this.falcorStore = createStore(props.store);
    attachOnChange.call(this, props.falcor, this.falcorStore);
  }

  getChildContext() {
    return {
      falcor: this.falcor,
      falcorStore: this.falcorStore,
    };
  }

  render() {
    const { children } = this.props;
    return Children.only(children);
  }
}
