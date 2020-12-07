import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { API_HOST, PROJECT_THEME } from 'config'

import get from "lodash.get"

import { Provider } from 'react-redux';
import store from 'store';
import {
	Themes,
	FalcorProvider,
	ThemeContext,
	falcorGraph,
	// addComponents,
	// addWrappers
} from "@availabs/avl-components"

import reportWebVitals from './reportWebVitals';

// import DmsComponents from "components/dms"
// import DmsWrappers from "components/dms/wrappers"

// import AmsComponents from "components/ams"
// import AmsWrappers, { enableAuth } from "components/ams/wrappers"

// addComponents(DmsComponents);
// addWrappers(DmsWrappers);
//
// addComponents(AmsComponents);
// addWrappers(AmsWrappers);

import 'styles/tailwind.css';

ReactDOM.render(
	<React.StrictMode>
		<Provider store={ store }>
			<FalcorProvider falcor={ falcorGraph(API_HOST) }>
				<ThemeContext.Provider value={ get(Themes, PROJECT_THEME, Themes["light"]) }>
					<App/>
					{ /*<AuthEnabledApp />*/ }
				</ThemeContext.Provider>
			</FalcorProvider>
		</Provider>
	</React.StrictMode>,
	document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
reportWebVitals();
