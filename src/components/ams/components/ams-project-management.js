import React from "react"

import Header from "components/avl-components/components/Header/HeaderComponent"

import GroupComponent, { GroupHeader } from "./components/GroupComponent"
import GroupBase from "./components/GroupBase"
import Requests from "./components/Requests"
import SendInvite from "./components/SendInvite"
import UserSearch from "./components/UserSearch"

import amsProjectManagementWrapper from "../wrappers/ams-project-management"

import matchSorter from 'match-sorter'

const AssignToProject = ({ assignToProject, ...props }) =>
  <GroupBase title="Assign to Project" { ...props } action="assign"
    onClick={ assignToProject } accessor={ d => d.name }/>

const CreateGroup = ({ createAndAssign, ...props }) =>
  <GroupBase title="Create Group" { ...props } action="create"
    onClick={ createAndAssign }/>

export default amsProjectManagementWrapper(({ groups, project, requests, users, ...props }) => {

  const [groupsInProject, otherGroups] = groups.reduce(([a1, a2], c) => {
    if (c.projects.reduce((a, c) => a || c.project_name === project, false)) {
      return [[...a1, c], a2]
    }
    return [a1, [...a2, c]];
  }, [[], []]);

  const usersInProject = users.filter(user =>
    user.projects.reduce((a, c) => a || (c.project_name === project), false)
  );

  const nameSorter = (a, b) => (
    a.name.toLowerCase() < b.name.toLowerCase() ? -1 :
    a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0
  );

  groupsInProject.sort(nameSorter);
  otherGroups.sort(nameSorter);

  const [groupSearch, setGroupSearch] = React.useState("");

  return (
    <div className="mt-16">
      <Header title="Project Management"/>
      <div className="py-20">

        <Requests requests={ requests } groups={ groupsInProject } { ...props }/>

        <SendInvite groups={ groupsInProject } project={ project } { ...props }/>

        <div className="mb-5 py-2 px-4 border-2 rounded max-w-2xl m-auto">
          <div className="mb-2">
            <AssignToProject { ...props } groups={ otherGroups }/>
          </div>
          <div className="mb-2">
            <CreateGroup { ...props }/>
          </div>
        </div>

        <UserSearch users={ usersInProject } { ...props }
          groups={ groupsInProject }
          project={ project }/>


        <div className="mb-5 py-2 px-4 border-2 rounded m-auto">
          <GroupHeader value={ groupSearch } onChange={ setGroupSearch}/>
          { matchSorter(groupsInProject, groupSearch, { keys: ["name"] })
              .map(group =>
                <GroupComponent key={ group.name } { ...props }
                  project={ project }
                  group={ group }
                  users={ usersInProject }/>
              )
          }
        </div>
      </div>
    </div>
  )
})
