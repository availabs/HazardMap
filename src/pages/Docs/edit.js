import {shmpDoc} from './docs.type'
import PageManager from './components/PageManager'
import PageEdit from './components/PageEdit'
import PageView from './components/PageView'


let config = {
    type: 'div',
    wrappers: [
        "dms-manager",
        "dms-provider",
        "dms-router",
        "show-loading",
        "dms-falcor",
        "with-auth"
    ],
    props: {
        format: shmpDoc,
        title: "Documentation",
    },
    children: [
        {
            type: PageManager,
            props: { dmsAction: "list" }
        },
        {
            type: PageEdit,
            props: {dmsAction: "create"},
            wrappers: ["dms-create", "with-auth"]
        },

        {
            type: PageEdit,
            props: {dmsAction: "edit"},
            wrappers: ["dms-edit", "with-auth"]
        }
    ]
}

export default {
    path: "/cms",
    mainNav: true,
    // exact: true,
    auth: false,
    name: 'CMS',
    icon: '',
    layout: 'Simple',
    layoutSettings: {
        fixed: true,
        nav: 'side',
        maxWidth: '',
        headerBar: false,
        
    },
    component: config
}
