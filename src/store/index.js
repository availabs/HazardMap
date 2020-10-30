
import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

// import { reducer as graph } from 'utils/redux-falcor';

import falcorCache from "utils/redux-falcor-new/falcorCache"

import user from './user';
import geo from './modules/geo';
import stormEvents from "./modules/stormEvents";
import femaDisasterDeclarations from "./modules/femaDisasterDeclarations";
import messages from './messages';

const reducer = combineReducers({
  user,
  geo,
  stormEvents,
  femaDisasterDeclarations,
  messages,
  falcorCache
});

export default createStore(reducer, applyMiddleware(thunk))
