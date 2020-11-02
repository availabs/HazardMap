import { GET_GROUPS } from "../api/groups"

const INITIAL_STATE = [];

export default (state=INITIAL_STATE, action) => {
	switch (action.type) {
		case GET_GROUPS:
			return action.groups;
		default:
			return state;
	}
}
