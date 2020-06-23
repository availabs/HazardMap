import DmsComponents from "components/DMS"
import DmsWrappers from "components/DMS/wrappers"

import DocsPage from "./docs-page"

import {
  addComponents,
  addWrappers
} from "components/avl-components/ComponentFactory"

import config from "./config"

addComponents(DmsComponents)
addComponents({ "docs-page": DocsPage })
addWrappers(DmsWrappers)

export default {
  path: "/dms-docs",
  mainNav: true,
  // exact: true,
  auth: true,
  name: 'DMS Docs',
  icon: 'fas fa-sticky-note',
  layoutSettings: {
    nav: 'side',
    fixed: true,
    headerBar: false,
    theme: 'TEST_THEME'
  },
  component: config
}
