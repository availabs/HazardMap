import { sendSystemMessage } from 'components/avl-components/messages/reducer';

import { AUTH_HOST } from 'config';

import { postJson } from "./utils"

export const GET_PROJECTS = "AMS::GET_PROJECTS";

export const getProjects = () =>
  (dispatch, getState) => {
    const { token } = getState().user;
    if (token) {
      postJson(`${ AUTH_HOST }/projects`, { token })
        .then(res => {
          if (res.error) {
              dispatch(sendSystemMessage(res.error));
          }
          else {
              dispatch({
                type: GET_PROJECTS,
                ...res
              })
          }
        })
    }
    else {
      return Promise.resolve();
    }
  }

export const createProject = name =>
  (dispatch, getState) => {
    const { token } = getState().user;
    if (token) {
      postJson("/project/create", { token, name })
        .then(res => {
          if (res.error) {
              dispatch(sendSystemMessage(res.error));
          }
          else {
              dispatch(sendSystemMessage(res.message));
              dispatch(getProjects());
          }
        })
    }
    else {
      return Promise.resolve();
    }
  }
export const deleteProject = name =>
  (dispatch, getState) => {
    const { token } = getState().user;
    if (token) {
      postJson("/project/delete", { token, name })
        .then(res => {
          if (res.error) {
              dispatch(sendSystemMessage(res.error));
          }
          else {
              dispatch(sendSystemMessage(res.message));
              dispatch(getProjects());
          }
        })
    }
    else {
      return Promise.resolve();
    }
  }
