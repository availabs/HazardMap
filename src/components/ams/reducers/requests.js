import { GET_REQUESTS } from "../api/requests"

const INITIAL_STATE = [];

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case GET_REQUESTS:
      return action.requests;
    default:
      return state;
  }
}
