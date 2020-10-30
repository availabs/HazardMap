
// --- Public Pages ------

import StormEvents from 'pages/StormEvents'
import NoMatch from 'pages/404';
import Login from "pages/Login"
import Logout from "pages/Logout"
import Home from "pages/home"
import DataDownload from "pages/DataDownload"
import Methodology from "pages/Methodology/methodology"
import FemaDisasterDeclaration from "./pages/fema_disasters/components/femaDisasterDeclarations";
import SBAHazardLoans from './pages/SBAEvents/index'
import FemaHmapV1 from './pages/femaHmapV1/index'
import FemaDisasters from './pages/fema_disasters/index'
import Overview from './pages/Overview/index'

// these two files below are just for testing the uplots bars and log graphs
// import Test from "./pages/Overview/uPlots/test_bar";
// import Test from "./pages/Overview/uPlots/test_log"

export default [
	// -- public
	...StormEvents,
	...SBAHazardLoans,
	...FemaHmapV1,
	...FemaDisasters,
	Login,
	Logout,
	Home,
	DataDownload,
	...Methodology,
	...FemaDisasterDeclaration,
	...Overview,

	//...Test,
	// -- util
	NoMatch
];
