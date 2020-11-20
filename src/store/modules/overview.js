// import { sendSystemMessage } from './messages';

// import { AUTH_HOST, AUTH_PROJECT_NAME } from 'config'


const SET_COUNTY_GEOID = 'USER::SET_COUNTY_GEOID';

function setCountyGeoid(id) {
    return {
        type:SET_COUNTY_GEOID,
        id
    }
}

export const setActiveCountyGeoid = (id) =>{
    return (dispatch) => {
        dispatch(setCountyGeoid(id))
    }
};



export const actions = {
    setActiveCountyGeoid,

};

let initialState = {
    activeCountyGeoid: null,
};

const ACTION_HANDLERS = {

    [SET_COUNTY_GEOID]: (state =initialState, action) => {
        const newState = Object.assign({}, state)
        if(action.id) {
            newState.activeCountyGeoid = action.id;
            localStorage.setItem('countyGeoid', newState.activeCountyGeoid);
        }
        return newState
    },

};

export default function overviewReducer(state = initialState, action) {

    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
