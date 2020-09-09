
import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
// import { reducer as graph } from 'utils/redux-falcor';

import falcorCache from "utils/redux-falcor-new/falcorCache"

import user from './user';
import stormEvents from "./stormEvents";
import messages from './messages';

const reducer = combineReducers({
  user,
  stormEvents,
  messages,
  falcorCache
});

export default createStore(reducer, applyMiddleware(thunk))
