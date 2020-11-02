import { /*docsPage, docsSection,*/ shmpDoc } from './docs.type'
//import SectionManager from './components/SectionManager'
//import PageEdit from './components/PageEdit'
import PageView from './components/PageView'



let config = {
  type: "dms-manager", // top level component for managing data items
  wrappers: [
    "dms-provider",
    "dms-falcor",
    "dms-router"
  ],
  props: {
    format: shmpDoc,
    title: " ",
    className: 'h-full',
    noHeader: true
  },
  children: [
    { type: PageView,
      dmsAction: "view"
    },
  ]
}

export default 
{
  path: "/methods",
  mainNav: true,
  exact: false,
  auth: false,
  name: 'Methodology',
  icon: '',
  //layout: 'Simple',
  component: config,
  layoutSettings: {
    fixed: false,
    headerBar: false,
    nav: 'top',
  }
}
