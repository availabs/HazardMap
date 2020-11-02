import { sendSystemMessage } from 'components/avl-components/messages/reducer';

import { AUTH_HOST, PROJECT_NAME, CLIENT_HOST } from 'config';

import { postJson } from "./utils"

export const USER_LOGIN = 'AMS::USER_LOGIN';
export const USER_LOGOUT = 'AMS::USER_LOGOUT';
export const AUTH_FAILURE = 'AMS::AUTH_FAILURE';
export const UPDATE_USER = 'AMS::UPDATE_USER';
export const IS_AUTHENTICATING = 'AMS::IS_AUTHENTICATING';

export const receiveAuthResponse = user => ({
  type: USER_LOGIN,
  user
});

export const setUserToken = user => {
  if (localStorage) {
    localStorage.setItem('userToken', user.token);
  }
};
export const getUserToken = user => {
  if (localStorage) {
    return localStorage.getItem('userToken');
  }
  return null;
};
export const removeUserToken = () => {
  if (localStorage) {
    localStorage.removeItem('userToken');
  }
};

export const logout = () => dispatch =>
  Promise.resolve(dispatch({ type: USER_LOGOUT }));

export const isAuthenticating = () => ({
  type: IS_AUTHENTICATING
})

export const login = (email, password) => dispatch => {
  dispatch(isAuthenticating());
  return postJson(`${ AUTH_HOST }/login`, { email, password, project: PROJECT_NAME })
    .then(res => {
      if (res.error) {
        dispatch({ type: AUTH_FAILURE });
        dispatch(sendSystemMessage(res.error, { type: 'Danger' }));
      }
      else {
        dispatch(receiveAuthResponse(res.user));
      }
    })
    .catch(error => {
      dispatch(sendSystemMessage('Cannot contact authentication server.'));
      dispatch({ type: AUTH_FAILURE });
    });
}

export const auth = (token = getUserToken()) => dispatch => {
  if (token) {
    dispatch(isAuthenticating());
    return postJson(`${ AUTH_HOST }/auth`, { token, project: PROJECT_NAME })
      .then(res => {
        if (res.error) {
          dispatch({ type: AUTH_FAILURE });
          dispatch(sendSystemMessage(res.error));
        }
        else {
          dispatch(receiveAuthResponse(res.user));
        }
      })
      .catch(error => {
        dispatch(sendSystemMessage('Cannot contact authentication server.'));
        dispatch({ type: AUTH_FAILURE });
      });
  }
  return dispatch({ type: AUTH_FAILURE });
};

export const updatePassword = (current, password) =>
  (dispatch, getState) => {
    const { token } = getState().user;
    if (token) {
      return postJson(`${ AUTH_HOST }/password/update`, { token, current, password })
        .then(res => {
          if (res.error) {
            return dispatch(sendSystemMessage(res.error));
          } else {
            setUserToken(res);
            dispatch(sendSystemMessage(res.message));
            return dispatch({
              type: UPDATE_USER,
              update: { token: res.token }
            });
          }
        });
    }
    return Promise.resolve();
  }

export const setPassword = (token, password) => dispatch =>
  postJson(`${ AUTH_HOST }/password/set`, { token, password, host: CLIENT_HOST, url: "/auth/set-passord" })
    .then(res => {
      if (res.error) {
        dispatch(sendSystemMessage(res.error));
      }
      else {
        if (res.message) {
          dispatch(sendSystemMessage(res.message));
        }
        return dispatch(auth(res.token));
      }
    });

export const resetPassword = email => dispatch =>
  postJson(`${ AUTH_HOST }/password/reset`, {
      email, project_name: PROJECT_NAME,
      host: CLIENT_HOST, url: "/auth/set-password"
    })
    .then(res => {
      if (res.error) {
        dispatch(sendSystemMessage(res.error));
      } else {
        dispatch(sendSystemMessage(res.message));
      }
    });
