import { /*docsPage, docsSection,*/ ctpDoc } from './docs.type'
//import SectionManager from './components/SectionManager'
//import PageEdit from './components/PageEdit'
import PageView from './components/PageView'

let config = {
    type: "dms-manager", // top level component for managing data items
    wrappers: [
        "dms-provider",
        "dms-falcor",
    ],
    props: {
        format: ctpDoc,
        title: " ",
        className: 'h-full',
        noHeader: true
    },
    children: [
        PageView
    ]
}

export default config