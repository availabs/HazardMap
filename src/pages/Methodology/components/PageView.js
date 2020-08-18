import React  from "react"
import { useTheme } from "components/avl-components/wrappers/with-theme"

import { SideNav } from 'components/avl-components/components'

import ReadOnlyEditor from "components/dms/components/editor/editor.read-only"

const View = ({ item, dataItems, ...props }) => {
    const theme = useTheme;
    console.log('view', item,dataItems, props)

    if (!item ) {
        item = dataItems[0]
    }
    if(!item || !item.data ) return null

    const { data } = item

    let navItems = dataItems
        .filter(d => d.data.sectionLanding)
        .map((d,i) => {
            return {
                name: d.data.section,
                path: `/docs/view/${d.id}`,
                sectionClass: 'mb-4',
                itemClass: 'font-bold',
                children: dataItems
                    .filter(({ data }) => !data.sectionLanding && (data.section === d.data.section))
                    .map(p => ({name: p.data.title, path: `/docs/view/${p.id}`, itemClass: 'font-thin -mt-2'}))
            }
        })

    return (
        <div className={ `max-w-7xl mx-auto flex items-start`}>
            <div className='w-60 border-2 overflow-hidden'>
                <SideNav menuItems={navItems} />
            </div>
            <div className="w-full flex flex-col justify-center hasValue h-min-screen pl-4">
                <div className={`px-2 pt-2 pb-6 text-3xl font-bold leading-7 ${theme.text}`}>
                    {data.title}
                </div>
                <div className={'p-2 pb-6 font-thin'}>
                    <ReadOnlyEditor value={data.content} />
                </div>
            </div>
        </div>
    )
}

export default View