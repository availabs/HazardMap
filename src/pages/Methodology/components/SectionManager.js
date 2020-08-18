import React, { useState  }  from "react"
import { Link } from 'react-router-dom'

import { List, ListItemAction, Input } from 'components/avl-components/components'

import { DmsButton } from "components/dms/components/dms-button"

import { makeFilter } from "components/dms/utils"

// import ReadOnlyEditor from "components/DMS/components/editor/editor.read-only"

const DmsTable = ({ sortBy, sortOrder, columns, initialPageSize, Container, ...props }) => {
    const [newSectionTitle, setNewSectionTitle] = useState('');

    const filter = makeFilter(props),
        dataItems = (filter ? props.dataItems.filter(filter) : props.dataItems);


    return (
        <div>

            <div className="flex">
                <Input value={ newSectionTitle } onChange={ setNewSectionTitle }
                       className='w-full text-xl p-4 flex-1 rounded-lg'
                       placeholder="Enter section name..." autoFocus/>
                <DmsButton large className="flex-0 text-xl ml-3 px-8"
                           disabled={ !Boolean(newSectionTitle) }
                           action={ {
                               action: 'api:create',
                               seedProps: () => ({ section: newSectionTitle, sectionLanding: 1 })
                           } }
                />
            </div>
            {!props.dataItems.length ? null :
                (
                    dataItems
                        .filter(d => d.data.sectionLanding)
                        .map((d,i) => {
                            const subSections = props.dataItems
                                .filter(({ data }) => !data.sectionLanding && (data.section === d.data.section));
                            return (
                                <List key={i} className='my-3'>
                                    <ListItemAction
                                        item={`${d.id} ${d.data.section}`}
                                        action={ [
                                            <DmsButton key="create"
                                                       action={{
                                                           action: 'create',
                                                           seedProps: () => ({section: d.data.section, index: subSections.length })
                                                       }}
                                                       label='Add Page'
                                            />,
                                            <DmsButton item={ d.id } action="edit" className="ml-3 flex-0"/>,
                                            <DmsButton key="api:delete" item={ d.id }
                                                       className="ml-2"
                                                       action={ {
                                                           action: 'api:delete',
                                                           showConfirm: true
                                                       } }
                                                       label='Delete'
                                            />
                                        ]
                                        }
                                    />
                                    { subSections.map(d =>
                                        <div key={ d.id } className="p-3 m-3 mt-0 flex border-2 rounded-lg">
                                            <div className="flex-1"><Link to={`docs/view/${d.id}`}><h4>{ d.data.title }</h4></Link></div>
                                            <DmsButton item={ d.id } action="edit" className="ml-3 flex-0"/>
                                            <DmsButton item={ d.id } action="api:delete" className="ml-3 flex-0"/>
                                        </div>
                                    )
                                    }
                                </List>
                            )
                        })

                )}
        </div>
    )
}

DmsTable.defaultProps = {
    dmsAction: "list",
    dataItems: [],
    columns: [],
    filter: false,
    sortBy: "updated_at",
    sortOrder: "desc",
    initialPageSize: 10,
    striped: false
}
export default DmsTable;