import { auth } from "./auth"
import { sendSystemMessage } from 'components/avl-components/messages/reducer';
// import { getRequests } from "./requests.module"

import { AUTH_HOST/*, PROJECT_NAME*/ } from 'config';

import { postJson } from "./utils"

export const GET_USERS = "AMS::GET_USERS";
export const USERS_IN_GROUPS = "AMS::USERS_IN_GROUPS";

export const getUsers = () =>
	(dispatch, getState) => {
		const { token } = getState().user;
		if (token) {
			return postJson(`${ AUTH_HOST }/users`, { token })
				.then(res => {
					if (res.error) {
						dispatch(sendSystemMessage(res.error));
					}
					else {
						dispatch({
							type: GET_USERS,
							...res
						})
					}
				})
		}
		return Promise.resolve();
	}
export const usersForGroup = group =>
	(dispatch, getState) => {
		const { token } = getState().user;
		if (token) {
			return postJson(`${ AUTH_HOST }/users/bygroup`, { token, groups: [group] })
				.then(res => {
					if (res.error) {
						dispatch(sendSystemMessage(res.error));
					}
					else {
						dispatch({
							type: USERS_IN_GROUPS,
              group,
              ...res
						})
					}
				})
		}
		return Promise.resolve();
	}

export const assignToGroup = (user_email, group_name) =>
	(dispatch, getState) => {
		const { token, email } = getState().user;
		if (token) {
			return postJson(`${ AUTH_HOST }/user/group/assign`, { token, user_email, group_name })
				.then(res => {
					if (res.error) {
						return dispatch(sendSystemMessage(res.error));
					}
					else {
						return dispatch(getUsers())
              .then(() => {
                if (email === user_email) {
                  dispatch(auth());
                }
              })
              .then(() => {
    						if (res.message) {
    							return dispatch(sendSystemMessage(res.message));
    						}
              })
					}
				})
		}
		return Promise.resolve();
	}
export const removeFromGroup = (user_email, group_name) =>
	(dispatch, getState) => {
		const { token, email } = getState().user;
		if (token) {
			return postJson(`${ AUTH_HOST }/user/group/remove`, { token, user_email, group_name })
				.then(res => {
					if (res.error) {
						dispatch(sendSystemMessage(res.error));
					}
					else {
						return dispatch(getUsers())
              .then(() => {
                if (email === user_email) {
                  dispatch(auth());
                }
              })
              .then(() => {
    						if (res.message) {
    							dispatch(sendSystemMessage(res.message));
    						}
              })
					}
				})
		}
		return Promise.resolve();
	}

export const deleteUser = user_email =>
	(dispatch, getState) => {
		const { token } = getState().user;
		if (token) {
			return postJson(`${ AUTH_HOST }/user/delete`, { token, user_email })
				.then(res => {
					if (res.error) {
						dispatch(sendSystemMessage(res.error))
					}
					else {
						// dispatch(getRequests());
						dispatch(getUsers());
						dispatch(auth());
						if (res.message) {
							dispatch(sendSystemMessage(res.message));
						}
					}
				})
		}
		return Promise.resolve();
	}

export const createFake = () =>
	(dispatch, getState) => {
  	const { token } = getState().user;
  	if (token) {
  		return postJson(`${ AUTH_HOST }/user/create/fake`, { token })
  			.then(res => {
  				if (res.error) {
  					dispatch(sendSystemMessage(res.error));
  				}
  				else {
  					dispatch(getUsers());
  					dispatch(sendSystemMessage(res.message, { duration: 10000 }));
  				}
  			})
  	}
  	return Promise.resolve();
	}
