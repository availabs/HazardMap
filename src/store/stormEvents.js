// import { sendSystemMessage } from './messages';

// import { AUTH_HOST, AUTH_PROJECT_NAME } from 'config'


const SET_STATE_GEOID = 'USER::SET_STATE_GEOID';

function setStateGeoid(id) {
    return {
        type:SET_STATE_GEOID,
        id
    }
}

export const setActiveStateGeoid = (id) =>{
    return (dispatch) => {
        dispatch(setStateGeoid(id))
    }
};



export const actions = {
    setActiveStateGeoid,

};

let initialState = {
    activeStateGeoid: [],
};

const ACTION_HANDLERS = {

    [SET_STATE_GEOID]: (state =initialState, action) => {
        const newState = Object.assign({}, state)
        if(action.id) {
            newState.activeStateGeoid = action.id;
            localStorage.setItem('stateGeoid', newState.activeStateGeoid);
        }
        return newState
    },

};

export default function scenarioReducer(state = initialState, action) {

    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}