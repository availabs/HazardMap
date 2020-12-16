import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

// import { reducer as graph } from 'utils/redux-falcor';

import falcorCache from "utils/redux-falcor-new/falcorCache"


import messages from './messages';
import reducers from "components/ams/src/reducers"
import overview from "./modules/overview";
import stormEvents from "./modules/stormEvents";
import femaDisasterDeclarations from "./modules/femaDisasterDeclarations";
import geo from "./modules/geo";


const reducer = combineReducers({
  ...reducers,
  stormEvents,
  femaDisasterDeclarations,
  geo,
  overview,
  messages,
  // graph
  falcorCache
});

export default createStore(reducer, applyMiddleware(thunk))
