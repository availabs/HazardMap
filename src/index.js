import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { API_HOST, PROJECT_THEME } from 'config'

import get from "lodash.get"

import { Provider } from 'react-redux';
import store from 'store';
import {
	Themes,
	ThemeContext,
	/*//FalcorProvider,

	falcorGraph,
	addComponents,
	addWrappers*/
} from "@availabs/avl-components"
import { falcorGraph } from 'store/falcorGraphNew'
import { FalcorProvider } from 'utils/redux-falcor-new'

import reportWebVitals from './reportWebVitals';

// import DmsComponents from "components/dms"
// import DmsWrappers from "components/dms/wrappers"

// import AmsComponents from "components/ams"
// import AmsWrappers, { enableAuth } from "components/ams/wrappers"

//addComponents(DmsComponents);
// addWrappers(DmsWrappers);
//
// addComponents(AmsComponents);
// addWrappers(AmsWrappers);

import Theme from './Theme'
import {useTheme} from "@availabs/avl-components/dist/wrappers";
import 'styles/tailwind.css';
//const theme = useTheme()
ReactDOM.render(
	<React.StrictMode>
		<Provider store={ store }>
			<FalcorProvider falcor={ falcorGraph}>
				<ThemeContext.Provider value={ Themes["light"]}>
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
