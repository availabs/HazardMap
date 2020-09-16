// import { sendSystemMessage } from './messages';

// import { AUTH_HOST, AUTH_PROJECT_NAME } from 'config'


const SET_IA_AMOUNT = 'USER::SET_IA_AMOUNT';

function setIAAmount(id) {
    return {
        type:SET_IA_AMOUNT,
        id
    }
}

export const setActiveIAAmount = (id) =>{
    return (dispatch) => {
        dispatch(setIAAmount(id))
    }
};



export const actions = {
    setActiveIAAmount,

};

let initialState = {
    activeIAAmount: null,
};

const ACTION_HANDLERS = {

    [SET_IA_AMOUNT]: (state =initialState, action) => {
        const newState = Object.assign({}, state)
        if(action.id) {
            newState.activeIAAmount = action.id;
            localStorage.setItem('IAAmount', newState.activeIAAmount);
        }
        return newState
    },

};

export default function scenarioReducer(state = initialState, action) {

    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
