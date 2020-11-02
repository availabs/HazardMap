import { GET_PROJECTS } from "../api/projects"

const INITIAL_STATE = [];

export default (state=INITIAL_STATE, action) => {
  switch (action.type) {
    case GET_PROJECTS:
      return action.projects;
    default:
      return state;
  }
}
