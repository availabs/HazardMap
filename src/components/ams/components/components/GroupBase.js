import React from "react"

import { Button } from "components/avl-components/components/Button"
import { Input, Select } from "components/avl-components/components/Inputs"

const verify = (groupName, authLevel, userAuthLevel) =>
  Boolean(groupName) && (authLevel >= 0) && (userAuthLevel >= authLevel)

export default ({ title, action, onClick, user, groups = null, accessor = (d => d) }) => {
  const [groupName, setGroupName] = React.useState(""),
    [authLevel, setAuthLevel] = React.useState(-1);

  const onSubmit = React.useCallback(e => {
    e.preventDefault();
    onClick(accessor(groupName), authLevel)
      .then(() => {
        setGroupName("");
        setAuthLevel(-1);
      })
  }, [onClick, accessor, groupName, authLevel]);

  return (
    <div>
      <div className="border-b-2 mb-1">
        <div className="grid grid-cols-4 gap-1">
          <div className="col-span-2 font-bold">
            { title }
          </div>
          <div className="col-span-1">
            Authority Level
          </div>
        </div>
      </div>
      <form onSubmit={ onSubmit }>
        <div className="grid grid-cols-4 gap-1">
          <div className="col-span-2">
            { groups ?
              <Select domain={ groups } accessor={ accessor } multi={ false }
                value={ groupName } onChange={ setGroupName }
                placeholder="Select a group..."/>
              :
              <Input placeholder="Enter group name..." required showClear
                value={ groupName } onChange={ setGroupName }/>
            }
          </div>
          <div className="col-span-1">
            <Input type="number" min="0" max="10"
              value={ authLevel } onChange={ setAuthLevel }/>
          </div>
          <div className="col-span-1 flex justify-center">
            <Button type="submit" block
              disabled={ !verify(groupName, authLevel, user.authLevel) }>
              { action }
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
