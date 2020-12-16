import React from "react"
// import get from 'lodash.get'
import {useTheme} from "components/avl-components/src/wrappers/with-theme"

import {DmsButton} from "components/dms/components/dms-button"

import {TopNav} from 'components/avl-components/src/components'

import SectionManager from './SectionManager'
//import SectionView from './SectionView'
// import SectionEdit from './SectionEdit'
// import AuthMenu from 'pages/Auth/AuthMenu'

import logo from './Logo.js'


export const Create = ({createState, setValues, item, dataItems, ...props}) => {

    const theme = useTheme();
    dataItems = dataItems.sort((a, b) => a.data.index - b.data.index)
    if (!item) {
        item = dataItems.filter(d => d.data.sectionLanding && d.data.index === 0).pop()
    }
    if (!item || !item.data) return null

    // const {data} = item
    let navItems = dataItems
        .filter(d => d.data.sectionLanding)
        .map((d) => {
            return {
                name: d.data.section,
                id: d.id,
                path: `/cms/edit/${d.id}`, // d.data['url-slug'],
                sectionClass: 'mb-4',
                itemClass: 'font-bold',
                children: dataItems
                    .filter(({data}) => !data.sectionLanding && (data.section === d.data.section))
                    .map(p => ({name: p.data.title, id:p.id, path: `/cms/edit/${p.id}`, itemClass: 'font-thin -mt-2'})),
                rest: props
            }
        })
   // let activePage = props['doc-page'] || item
   /* let subNav = data.sectionLanding ? get(navItems.filter((data) => (data.id === get(activePage, `id`))), `[0].children`, []) :
        get(navItems.filter((data) => (data.children.map(c => c.id).includes(get(activePage, `id`)))), `[0].children`, [])*/


    let Title = createState.sections[0].attributes.filter(a => a.key === 'title').pop()
    let URL = createState.sections[0].attributes.filter(a => a.key === 'url-slug').pop()
    let Sections = createState.sections[0].attributes.filter(a => a.key === 'sections').pop()

    
    return (
        <div className={`flex items-start flex-col min-h-screen`}>
            <div className='w-full'>
                <TopNav 
                    menuItems={navItems} 
                    logo={logo('SHMP')}
                    customTheme={{
                        sidebarBg: 'bg-white',
                        topNavHeight: 'h-12' ,
                        navitemTop: 'px-8 inline-flex items-center border-b border-r border-gray-200 text-base font-normal text-gray-800 hover:pb-4 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out'
                    }}
                />
                
            </div>
            
            <div className="w-full hasValue flex-1 p-1 md:p-6">
                <div className={'bg-white shadow h-full flex justify-between flex-col lg:flex-row'}>
                	<div className='w-full lg:w-64 p-4'> 
                		<div className="">
                			<div>
	                			Title
	                            <Title.Input
	                                autoFocus={true}
	                                value={Title.value}
	                                placeholder={'Title'}
	                                onChange={Title.onChange}
	                            />
                            </div>
                            <div>
                            	url
	                            <URL.Input
	                                className={`ml-2 ${theme.text}`}
	                                autoFocus={true}
	                                value={URL.value}
	                                placeholder={'/url'}
	                                onChange={URL.onChange}
	                            />
	                        </div>
	                        <div className="mt-2 mb-4 max-w-2xl">
			                    <DmsButton 
			                    	className="w-full" 
			                    	large type="submit"
			                        action={createState.dmsAction} 
			                        item={item} 
			                       	props={props}/>
			                </div>
                        </div>
                	</div>
                	<div className='border-l py-8 max-w-6xl flex-1'>
                        <div className='font-sm font-light text-md'>

                        	<SectionManager
                        		Attribute={Sections}
                        		value={Sections.value}
                                onChange={Sections.onChange}
                        	/>
                           {/*<Sections.Input
                            	className={`p-4 border-none active:border-none focus:outline-none custom-bg h-full ${theme.text}`}
                                value={Sections.value}
                                onChange={Sections.onChange}
                                DisplayComp={SectionView}
                                EditComp={SectionEdit}
                            />*/}
                        </div>
                    </div>
                    <div
                        className={`p-2 font-thin overflow-hidden`}>

                    </div>
                    <div className='hidden xl:block xl:w-56'/>
                </div>
                
            </div>
        </div>
    )
}

export default Create
