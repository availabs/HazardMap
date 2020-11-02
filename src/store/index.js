import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

// import { reducer as graph } from 'utils/redux-falcor';

import falcorCache from "utils/redux-falcor-new/falcorCache"


import messages from './messages';
import reducers from "components/ams/reducers"

import stormEvents from "./stormEvents";
import femaDisasterDeclarations from "./femaDisasterDeclarations";


const reducer = combineReducers({
  ...reducers,
  stormEvents,
  femaDisasterDeclarations,
  messages,
  // graph
  falcorCache
});

export default createStore(reducer, applyMiddleware(thunk))
