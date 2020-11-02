import React from "react"
import get from 'lodash.get'

import {TopNav} from 'components/avl-components/components'
//import AuthMenu from 'pages/Auth/AuthMenu'
import SectionView from './SectionView'

// import logo from './Logo.js'

const View = ({item, dataItems, ...props}) => {
    dataItems = dataItems.sort((a, b) => a.data.index - b.data.index)
    if (!item) {
        item = dataItems.filter(d => d.data.sectionLanding && d.data.index === 0).pop()
    }
    if (!item || !item.data) return null

    const {data} = item
    let navItems = dataItems
        .filter(d => d.data.sectionLanding)
        .map((d) => {
            return {
                name: d.data.section,
                id: d.id,
                path: `/methods/view/${d.id}`, // d.data['url-slug'],
                sectionClass: 'mb-4',
                itemClass: 'font-bold',
                children: dataItems
                    .filter(({data}) => !data.sectionLanding && (data.section === d.data.section))
                    .map(p => ({name: p.data.title, id:p.id, path: `/p/view/${p.id}`, itemClass: 'font-thin -mt-2'})),
                rest: props
            }
        })
    // let activePage = props['doc-page'] || item
    // let subNav = data.sectionLanding ? get(navItems.filter((data) => (data.id === get(activePage, `id`))), `[0].children`, []) :
    //     get(navItems.filter((data) => (data.children.map(c => c.id).includes(get(activePage, `id`)))), `[0].children`, [])

    return (
        <div className={`flex items-start flex-col min-h-screen`}>
            <div className='w-full'>
                <TopNav 
                    menuItems={navItems} 
                    open={false} 
                    //logo={logo('SHMP')} 
                    //rightMenu={<AuthMenu />}
                    customTheme={{
                            sidebarBg: 'bg-white',
                            topNavHeight: 'h-10' ,
                            navitemTop: 'px-8 inline-flex items-center border-b border-r border-gray-200 text-base font-normal text-gray-800 hover:pb-4 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out',
                            navitemTopActive: 'px-8 inline-flex items-center border-b border-r border-gray-200 text-base font-normal text-blue-500 hover:pb-4 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out'
                        }}
                />
                
            </div>
            <div className="w-full hasValue flex-1 p-1 md:p-6">
                <div className={'bg-white shadow h-full'}>
                	<div className='border-l py-8 max-w-6xl mx-auto'>
                    {
                        get(data, `sections`, []).map((section,i) => <SectionView key={i} value={section}/>)
                  
                    }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default View