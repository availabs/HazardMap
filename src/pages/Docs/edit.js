import {shmpDoc} from './docs.type'
import PageManager from './components/PageManager'
import PageEdit from './components/PageEdit'
// import PageView from './components/PageView'


let config = {
    type: 'div',
    wrappers: [
        "dms-manager",
        "dms-provider",
        "dms-router",
        "show-loading",
        "dms-falcor"
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
    mainNav: false,
    // exact: true,
    auth: false,
    name: 'CMS',
    icon: '',
    layoutSettings: {
        fixed: false,
        headerBar: false,
        nav: 'top',
    },
    component: config
}
