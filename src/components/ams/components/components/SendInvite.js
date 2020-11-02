import React from "react"

import { Button } from "components/avl-components/components/Button"
import { Input, Select } from "components/avl-components/components/Inputs"

const INITIAL_STATE = {
  email: "",
  verify: "",
  group: ""
}

const reducer = (state, action) => {
  switch (action.type) {
    case "update":
      return { ...state, ...action.update };
    case "reset":
      return { ...INITIAL_STATE };
    default:
      return state;
  }
}

export default ({ project, groups, sendInvite, ...props }) => {
  const [state, dispatch] = React.useReducer(reducer, INITIAL_STATE),
    { email, verify, group } = state,
    update = React.useCallback(update => {
      dispatch({ type: "update", update });
    }, []);

  groups = groups.map(g => ({
    ...g,
    authLevel: g.projects.reduce((a, c) => c.project_name === project ? c.auth_level : a, -1)
  })).sort((a, b) => {
    if (a.authLevel === b.authLevel) {
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    }
    return a.authLevel - b.authLevel;
  })

  const handleSubmit = React.useCallback(e => {
    e.preventDefault();
    sendInvite(email, group.name);
    dispatch({ type: "reset" });
  }, [email, group, sendInvite]);
  const canSubmit = email && verify && group && (email === verify);

  return (
    <div className="mb-5 py-2 px-4 border-2 rounded">
      <div className="grid grid-cols-10 gap-1 font-bold border-b-2 mb-1">
        <div className="col-span-3 text-xl">
          Send Invite
        </div>
        <div className="col-span-3 flex items-end">
          Verify Email
        </div>
        <div className="col-span-3 flex items-end">
          Assign to Group
        </div>
        <div className="col-span-1 flex items-end">
        </div>
      </div>
      <form onSubmit={ handleSubmit }>
        <div className="grid grid-cols-10 gap-1 mb-2">
          <div className="col-span-3">
            <Input placeholder="Enter user email..." type="email"
              onChange={ v => update({ email: v }) } value={ email }/>
          </div>
          <div className="col-span-3">
            <Input placeholder="Verify user email..." type="email"
              onChange={ v => update({ verify: v }) } value={ verify }/>
          </div>
          <div className="col-span-3">
            <Select domain={ groups } multi={ false }
              accessor={ g => g.name } placeholder="Select a group..."
              listAccessor={ g => `${g.name} (auth level ${ g.authLevel })` }
              onChange={ v => update({ group: v }) } value={ group }/>
          </div>
          <div className="col-span-1">
            <Button block type="submit" disabled={ !canSubmit }>
              send
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
