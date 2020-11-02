import React from "react"
import ReadOnlyEditor from "components/dms/components/editor/editor.read-only"
import { Button } from "components/avl-components/components/Button"

export default ({value, edit, remove}) => {
    if(!value) return false
    return (
        <div className='relative px-4 sm:px-6 lg:px-12'>
            <h3 className='section-header text-xl max-w-prose tracking-wider mx-auto my-2 font-medium border-b border-t border-color-gray-300 py-1 flex'>
                <div className='flex-1 py-1'>{value.title}</div>
                {edit ? 
                <Button 
                    className="ml-2 py-1 px-2"
                    onClick={ edit }  
                >Edit</Button>: ''}
                {remove ? 
                <Button 
                    className="ml-2 py-1 px-2"
                    onClick={ remove }  
                > X </Button>: ''}
            </h3>
            <div className='font-normal text-lg leading-9 text-gray-600 leading-tight'>
                <ReadOnlyEditor value={value.content} isRaw={value.content.blocks ? true : false}/>
            </div>
        </div>
    )
               
}
