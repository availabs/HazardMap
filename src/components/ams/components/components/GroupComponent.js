import React from "react"

import { Button } from "components/avl-components/components/Button"
import { Input/*, Select*/ } from "components/avl-components/components/Inputs"

import { useTheme } from "components/avl-components/wrappers/with-theme"

import UsersInGroup from "./UsersInGroup"

import get from "lodash.get"

export const GroupHeader = ({ onChange, value }) =>
  <div className="grid grid-cols-12 gap-3 text-center font-bold mb-1">
    <div className="col-span-4 text-left border-b-2 text-xl">
      <div>Groups in Project</div>
      <div className="mb-1">
        <Input small showClear placeholder="Search groups..."
          value={ value } onChange={ onChange }/>
      </div>
    </div>
    <div className="col-span-3 border-b-2 flex justify-center items-end">
      Adjust Project Authority
    </div>
    <div className="col-span-3 border-b-2 flex justify-center items-end">
      Remove from Project
    </div>
    <div className="col-span-2 border-b-2 flex justify-center items-end">
      Delete Group
    </div>
  </div>

const verify = (currAL, newAL) =>
  !isNaN(newAL) && (currAL !== newAL) && (newAL >= 0) && (newAL <= 10);

export default ({ group, project, adjustAuthLevel, deleteGroup, removeFromProject, ...props }) => {
  const [opened, setOpened] = React.useState(false),
    toggle = React.useCallback(() => setOpened(!opened), [opened]),
    Project = group.projects.reduce((a, c) => c.project_name === project ? c : a, {}),
    [authLevel, setAuthLevel] = React.useState(get(Project, "auth_level", -1));

  const submit = React.useCallback(e => {
    e.preventDefault();
    adjustAuthLevel(group.name, authLevel);
  }, [adjustAuthLevel, group.name, authLevel]);

  const theme = useTheme();

  return (
    <div className={ `
        mb-1 py-1 px-2 rounded ${ opened ? theme.accent1 : "" }`
      }>

      <div className="grid grid-cols-12 gap-3">

        <div className="col-span-4 flex items-center">
          <div className="w-6 cursor-pointer" onClick={ toggle }>
            { opened ?
              <span className="fa fa-minus"/> :
              <span className="fa fa-plus"/>
            }
          </div>
          <div className="flex-1">{ group.name }</div>
        </div>

        <div className="col-span-3">
          <form onSubmit={ submit }>
            <div className="grid grid-cols-12 gap-1 flex items-center">
              <div className="col-span-6">
                <Input type="number" min="0" max="10" required
                  value={ authLevel } onChange={ setAuthLevel }/>
              </div>
              <div className="col-span-6">
                <Button buttonTheme="buttonBlock" type="submit"
                  disabled={ !verify(+Project.auth_level, +authLevel) }>
                  adjust
                </Button>
              </div>
            </div>
          </form>
        </div>

        <div className="col-span-3 flex justify-center">
          <Button showConfirm
            onClick={ e => removeFromProject(group.name) }>
            remove
          </Button>
        </div>

        <div className="col-span-2 flex justify-center">
          <Button buttonTheme="buttonDanger" showConfirm
            onClick={ e => deleteGroup(group.name) }>
            delete
          </Button>
        </div>

      </div>
      { !opened ? null :
        <div className="mx-10 my-2">
          <UsersInGroup group={ group } { ...props }/>
        </div>
      }
    </div>
  )
}
