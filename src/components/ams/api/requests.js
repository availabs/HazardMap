import { sendSystemMessage } from 'components/avl-components/messages/reducer';
import { getUsers } from "./users"
import { receiveAuthResponse } from "./auth"

import { AUTH_HOST, PROJECT_NAME, CLIENT_HOST } from 'config';

import { postJson } from "./utils"

export const GET_REQUESTS = "AMS::GET_REQUESTS";

export const getRequests = () =>
  (dispatch, getState) => {
    const { token } = getState().user;
    if (token) {
      return postJson(`${ AUTH_HOST }/requests/byProject`, { token, project_name: PROJECT_NAME })
      	.then(res => {
        	if (res.error) {
          		dispatch(sendSystemMessage(res.error));
        	} else {
          		dispatch({
          			type: GET_REQUESTS,
                ...res
          		})
          		if (res.message) {
          			dispatch(sendSystemMessage(res.message));
          		}
        	}
      	})
    }
    return Promise.resolve();
  }

export const signup = (email, addToGroup = false) => dispatch =>
  postJson(`${ AUTH_HOST }/signup/request`, {
    email, addToGroup, project: PROJECT_NAME,
    host: CLIENT_HOST, url: addToGroup ? "/auth/verify-request" : "/auth/verify-email"
  }).then(res => {
      if (res.error) {
        return dispatch(sendSystemMessage(res.error, { type: 'Danger' }));
      } else {
        if (res.user) {
          dispatch(receiveAuthResponse(res.user));
        }
        return dispatch(sendSystemMessage(res.message));
      }
    })
    .catch(err => console.log('err', err));

export const signupAccept = (user_email, group_name) =>
  (dispatch, getState) => {
    const { token } = getState().user;
    if (token) {
      return postJson(`${ AUTH_HOST }/signup/accept`, {
          group_name, user_email, token,
          project_name: PROJECT_NAME,
          host: CLIENT_HOST, url: "/auth/set-password"
      }).then(res => {
        if (res.error) {
          return dispatch(sendSystemMessage(res.error, { type: 'Danger' }));
        } else {
          dispatch(getRequests());
          dispatch(getUsers());
          return dispatch(sendSystemMessage(res.message));
        }
      })
    }
    return Promise.resolve();
  }
export const signupReject = ({ user_email, project_name }) =>
  (dispatch, getState) => {
    const { token } = getState().user;
    if (token) {
      return postJson(`${ AUTH_HOST }/signup/reject`, {
        token, user_email, project_name
      }).then(res => {
        	if (res.error) {
          	dispatch(sendSystemMessage(res.error));
        	}
        	else {
      			dispatch(getRequests());
            dispatch(getUsers());
        		if (res.message) {
        			dispatch(sendSystemMessage(res.message));
        		}
        	}
      	})
    }
    return Promise.resolve();
  }
export const verifyEmail = token => dispatch =>
  postJson(`${ AUTH_HOST }/email/verify`, { token })
    .then(res => ({ dispatch, res, sendSystemMessage }));

export const verifyRequest = (token, password) => dispatch =>
  postJson(`${ AUTH_HOST }/signup/request/verify`, { token, password })
    .then(res => {
      if (res.error) {
        return dispatch(sendSystemMessage(res.error, { type: 'Danger' }));
      } else {
        dispatch(sendSystemMessage(res.message));
        return dispatch(receiveAuthResponse(res.user));
      }
    })

export const deleteRequest = request =>
  (dispatch, getState) => {
    const { token } = getState().user;
    if (token) {
      return postJson(`${ AUTH_HOST }/signup/delete`, { token, user_email: request.user_email, project_name: request.project_name })
        .then(res => {
          if (res.error) {
              dispatch(sendSystemMessage(res.error));
          }
          else {
            dispatch(getRequests());
            if (res.message) {
              dispatch(sendSystemMessage(res.message));
            }
          }
        })
    }
    return Promise.resolve();
  }

export const sendInvite = (user_email, group_name) =>
  (dispatch, getState) => {
    const { token } = getState().user;
    if (token) {
      return postJson(`${ AUTH_HOST }/invite`, {
        token, user_email, group_name, project_name: PROJECT_NAME,
        host: CLIENT_HOST, url: "/auth/accept-invite"
      }).then(res => {
        if (res.error) {
            dispatch(sendSystemMessage(res.error));
        }
        else {
          dispatch(getRequests());
          dispatch(sendSystemMessage(res.message));
        }
      })
    }
    return Promise.resolve();
  }
export const acceptInvite = (token, password) => dispatch =>
  postJson(`${ AUTH_HOST }/invite/accept`, { token, password })
    .then(res => {
      if (res.error) {
        return dispatch(sendSystemMessage(res.error, { type: 'Danger' }));
      } else {
        dispatch(sendSystemMessage(res.message));
        return dispatch(receiveAuthResponse(res.user));
      }
    })
