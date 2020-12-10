
// // --- Public Pages ------
// import CMS from 'pages/Pages/edit'
// import Pages from 'pages/Pages/view'

// import Auth from "pages/Auth"
// import NoMatch from 'pages/404';

// export default [
// 	// -- Public	
// 	...Pages, 
// 	CMS, // CMS Admin
// 	Auth,
// 	NoMatch
// ];



// --- Public Pages ------

import StormEvents from 'pages/StormEvents/index_combined'
import Home from "pages/home"
import DataDownload from "pages/DataDownload"
import Overview from './pages/Overview/index'
import DocsView from './pages/Docs/view'
import DocsEdit from './pages/Docs/edit'

import Auth from "pages/Auth"
import NoMatch from 'pages/404';

// these two files below are just for testing the uplots bars and log graphs
// import Test from "./pages/Overview/uPlots/test_bar";
// import Test from "./pages/Overview/uPlots/test_log"

export default [
	// -- public
	...StormEvents,
	Home,
	DataDownload,
	...Overview,
	DocsView,
	DocsEdit,

	//...Test,
	// -- util
	Auth,
	NoMatch
];
