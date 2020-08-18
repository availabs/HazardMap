import React from 'react';
import {ctpDoc} from './docs.type'
import SectionManager from './components/SectionManager'
import PageEdit from './components/PageEdit'
import PageView from './components/PageView'
import ComponentFactory from 'components/avl-components/ComponentFactory'
import {
    addComponents,
    addWrappers
} from "components/avl-components/ComponentFactory"
import viewConfig from './view'
import DmsComponents from "components/dms"
import DmsWrappers from "components/dms/wrappers"

addComponents(DmsComponents)
addWrappers(DmsWrappers)

let editorConfig = {
    type: "dms-content",
    // type: "dms-manager",
    wrappers: [
// wrapper order is important
// from index zero to i, higher index wrappers send props into lower index wrappers
// higher index wrappers do not see props from lower index wrappers
        "dms-manager",
        "dms-provider",
        "dms-router",
        "show-loading",
        "dms-falcor",
        "with-auth"
    ],
    props: {
        format: ctpDoc,
        title: "Documentation",
    },
    children: [
        { type: "dms-header",
            props: {
                title: "Documentation",
                shadowed: false
            }
        },
// dms-manager children are special
// they are only shown when the dms-manager state.stack.top.action === child.props.dmsAction
        { type: SectionManager,
            props: {
                dmsAction: "list"
            }
        },
        { type: PageView,
            props: { dmsAction: "view"},

        },

        { type: PageEdit,
            props: {
                dmsAction: "create",
            },
            wrappers: [ "dms-create", "with-auth"],
        },

        { type: PageEdit,
            props: { dmsAction: "edit" },
            wrappers: ["dms-edit","with-auth"]
        }
    ]
}

const Documentation = (props) => (
    <div>
        <h4> NPMRDS Documentation </h4>
        <ComponentFactory config={ viewConfig }/>
    </div>
)

const DocsEditor= (props) => (
    <div>
        <h4> NPMRDS Documentation </h4>
        <ComponentFactory config={ editorConfig }/>
    </div>
)


export default [{
    path: "/methodology",
    mainNav: true,
    // exact: true,
    auth: false,
    name: 'Methodology',
    icon: '',
    layoutSettings: {
        fixed: true,
        maxWidth: '',//'max-w-7xl',
        headerBar: false,
        nav: 'top',
        theme: 'flat',
    },
    component: Documentation
},
    {
        path: "/docs",
        mainNav: true,
        // exact: true,
        auth: false,
        name: 'Docs Editor',
        icon: '',
        layoutSettings: {
            fixed: true,
            maxWidth: '',//'max-w-7xl',
            headerBar: false,
            nav: 'top',
            theme: 'flat',
        },
        component: DocsEditor
    }
]
