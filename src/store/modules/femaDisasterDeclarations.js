// import { sendSystemMessage } from './messages';

// import { AUTH_HOST, AUTH_PROJECT_NAME } from 'config'


const SET_AMOUNT = 'USER::SET_AMOUNT';

function setAmount(id) {
    return {
        type:SET_AMOUNT,
        id
    }
}


export const setActiveAmount = (id) =>{
    return (dispatch) => {
        dispatch(setAmount(id))
    }
};





export const actions = {
    setActiveAmount,

};

let initialState = {
    activeAmount: null,
};

const ACTION_HANDLERS = {

    [SET_AMOUNT]: (state =initialState, action) => {
        const newState = Object.assign({}, state)
        if(action.id) {
            newState.activeAmount = action.id;
            localStorage.setItem('Amount', newState.activeAmount);
        }
        return newState
    }

};

export default function scenarioReducer(state = initialState, action) {

    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
