
// --- Public Pages ------

import StormEvents from 'pages/StormEvents'
import NoMatch from 'pages/404';
import Login from "pages/Login"
import Logout from "pages/Logout"
import Home from "pages/home"
import DataDownload from "pages/DataDownload"


export default [
	// -- public
	...StormEvents,
	Login,
	Logout,
	Home,
	DataDownload,
	// -- util
	NoMatch
];
