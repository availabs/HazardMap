import React from "react"

import { useDms } from "components/dms/contexts/dms-context"
import { useAuth } from "components/dms/contexts/auth-context"
// import { useTheme } from "components/avl-components/wrappers/with-theme"

import { useSetSections } from "components/dms/wrappers/dms-create"

import { createEmpty } from "components/dms/components/editor"

import { useDmsSections } from "components/dms/components/utils/dms-input-utils"
import { Button } from "components/avl-components/components/Button"


import get from 'lodash.get'

export default React.forwardRef(({ Attribute, id, autoFocus = false, onFocus, onBlur, onChange, value, addToArray, buttonDisabled, ...props }, ref) => {
  value = value || {};

  const Props = { ...props, ...useDms(), user: useAuth().user };
  const sections = useSetSections(Attribute.Format),
    Sections = useDmsSections(sections, value, onChange, Props);

  let Title = get(Sections, '[0].attributes',[]).filter(a => a.key === 'title').pop()
  let Content = get(Sections, '[0].attributes',[]).filter(a => a.key === 'content').pop()
 

  return (
    <div className='w-full'>
        <div className='relative px-4 sm:px-6 lg:px-12'>
            <h3 className='section-header text-xl max-w-prose tracking-wider mx-auto mb-2 mt-2 font-medium border-b border-t border-color-gray-300 py-2 flex'>
                {Title ? 
                <Title.Input
                    ref={ ref }
                    className='p-1'
                    autoFocus={true}
                    value={ value[Title.key] }
                    placeholder={'Section Title'}
                    onChange={Title.onChange}
                /> : ''}
                <Button 
                    className="ml-2 py-1 px-2"
                    onClick={ addToArray } 
                    disabled={ buttonDisabled }
                >
                    Save
                </Button>
            </h3>
            <div className='font-normal text-lg leading-9 text-gray-600 leading-tight'>
                {Content ? 
                <Content.Input
                    ref={ ref }
                    autoFocus={true}
                    value={ get(value, `[${Content.key}]`, createEmpty()) }
                    placeholder={'Section Content'}
                    onChange={Content.onChange}
                /> : ''}
            </div>
        </div>
    </div>
  )
})
