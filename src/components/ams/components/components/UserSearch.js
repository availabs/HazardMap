import React from "react"

import { Button } from "components/avl-components/components/Button"
import { Input, Select } from "components/avl-components/components/Inputs"

import matchSorter from 'match-sorter'

const UserInProjectHeader = () =>
  <div className="grid grid-cols-15 py-1 gap-3 font-bold">
    <div className="col-span-5 border-b-2">
      User Email
    </div>
    <div className="col-span-4 text-center border-b-2">
      Add to Group
    </div>
    <div className="col-span-4 text-center border-b-2">
      Remove from Group
    </div>
    <div className="col-span-2 text-center border-b-2">
      Delete User
    </div>
  </div>

const UserInProject = ({ project, user, groups, assignToGroup, removeFromGroup, deleteUser, ...props }) => {
  const [addTo, setAddTo] = React.useState(""),
    [removeFrom, setRemoveFrom] = React.useState("");

  groups = groups.map(g => ({
    ...g,
    authLevel: g.projects.reduce((a, c) => c.project_name === project ? c.auth_level : a, -1)
  })).sort((a, b) => {
    if (a.authLevel === b.authLevel) {
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    }
    return a.authLevel - b.authLevel;
  })

  const [userGroups, otherGroups] = groups.reduce(([a1, a2], c) => {
    if (user.groups.includes(c.name)) {
      a1.push(c);
    }
    else {
      a2.push(c);
    }
    return [a1, a2];
  }, [[], []]);

  const assign = React.useCallback(e => {
    assignToGroup(user.email, addTo.name);
    setAddTo("");
  }, [assignToGroup, user, addTo]);

  const remove = React.useCallback(e => {
    removeFromGroup(user.email, removeFrom.name);
    setRemoveFrom("");
  }, [removeFromGroup, user, removeFrom]);

  return (
    <div className="grid grid-cols-15 py-1 gap-3">
      <div className="col-span-5 whitespace-no-wrap overflow-hidden flex items-center">
        { user.email }
      </div>
      <div className="col-span-4">
        <div className="grid grid-cols-12 gap-1">
          <div className="col-span-8">
            <Select multi={ false } placeholder="Select a group..."
              options={ otherGroups } accessor={ g => g.name }
              listAccessor={ g => `${ g.name } (auth level ${ g.authLevel })` }
              value={ addTo } onChange={ setAddTo }/>
          </div>
          <div className="col-span-4">
            <Button block disabled={ !addTo }
              onClick={ assign }>
              add
            </Button>
          </div>
        </div>
      </div>
      <div className="col-span-4">
        <div className="grid grid-cols-12 gap-1">
          <div className="col-span-8">
            <Select multi={ false } placeholder="Select a group..."
              options={ userGroups } accessor={ g => g.name }
              value={ removeFrom } onChange={ setRemoveFrom }/>
          </div>
          <div className="col-span-4">
            <Button block disabled={ !removeFrom }
              onClick={ remove }>
              remove
            </Button>
          </div>
        </div>
      </div>
      <div className="col-span-2 flex justify-center">
        <Button buttonTheme="buttonDanger" showConfirm
          onClick={ e => deleteUser(user.email) }>
          delete
        </Button>
      </div>
    </div>
  )
}

export default ({ users, ...props }) => {
  const [search, setSearch] = React.useState(""),
    [amount, setAmount] = React.useState(5);

  const adjustAmount = React.useCallback(inc =>
    setAmount(amount + inc)
  , [amount]);

  const matches = matchSorter(users, search, { keys: ["email"] }),
    remaining = Math.max(0, matches.length - amount);

  return (
    <div className="mb-5 py-2 px-4 border-2 rounded m-auto">
      <div className={ `grid grid-cols-2 gap-x-3 gap-y-2` }>
        <div className="col-span-1">
          <Input placeholder="Search for a user..." showClear
            value={ search } onChange={ setSearch }/>
        </div>
        <div className="col-span-1">
          { !search ? null :
            <div className="flex justify-center">
              <Button className="mx-1"
                disabled={ amount === 5 }
                onClick={ e => adjustAmount(-5) }>
                Show Less
              </Button>
              <Button className="mx-1"
                disabled={ amount >= matches.length }
                onClick={ e => adjustAmount(5) }>
                Show More
              </Button>
            </div>
          }
        </div>
          { !search ? null :
            <div className="col-span-2">
              <UserInProjectHeader />
              { matches.slice(0, amount)
                  .map(user =>
                    <UserInProject key={ user.email } { ...props }
                      user={ user }/>
                  )
              }
            </div>
          }
      </div>
      { !(search && remaining) ? null :
        <div className="py-1">
          Plus { remaining } others...
        </div>
      }
    </div>
  )
}
