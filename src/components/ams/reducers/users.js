import { GET_USERS/*, USERS_IN_GROUPS*/ } from "../api/users";

const INITIAL_STATE = [];

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case GET_USERS:
      return action.users;
    // case USERS_IN_GROUPS:
    //   return { ...state,
    //     byGroup: {
    //       ...state.byGroup,
    //       [action.group]: action.users
    //     }
    //   };
    default:
      return state;
  }
}
