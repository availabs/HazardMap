const SEND_SYSTEM_MESSAGE = "SEND_SYSTEM_MESSAGE",
  DISMISS_SYSTEM_MESSAGE = "DISMISS_SYSTEM_MESSAGE";

let UNIQUE_ID = 0;
const getUniqueId = () =>
  `system-message-${ ++UNIQUE_ID }`;

const MESSAGE_TYPES = ["success", "info", "warning", "danger", 'LOGIN ERROR', 'SIGNUP ERROR'];
const DEFAULT_MESSAGE_TYPE = "warning";
const DEFAULT_MESSAGE_OPTIONS = {
  duration: 7500,
  type: DEFAULT_MESSAGE_TYPE,
  onDismiss: () => {},
  onConfirm: null
}
const getMessageOptions = options => {
  if (!options.id) {
    options.id = getUniqueId();
  }
  if (!MESSAGE_TYPES.includes(options.type)) {
    options.type = DEFAULT_MESSAGE_TYPE;
  }
  return options;
}

export const sendSystemMessage = (message, options={}) => {
  return dispatch => {
    return (dispatch({
      type: SEND_SYSTEM_MESSAGE,
      message,
      options: getMessageOptions({ ...DEFAULT_MESSAGE_OPTIONS, ...options })
    }),
    Promise.resolve())
  }
}

export const dismissSystemMessage = id => {
  return dispatch => {
    return (dispatch({
      type: DISMISS_SYSTEM_MESSAGE,
      id
    }),
    Promise.resolve())
  }
}

export default (state=[], action) => {
  switch (action.type) {
    case SEND_SYSTEM_MESSAGE: {
      let newState = state.filter(({ id }) => id !== action.options.id);
      newState.push({ message: action.message, ...action.options });
      return newState;
    }
    case DISMISS_SYSTEM_MESSAGE: {
      return state.filter(({ id }) => id !== action.id);
    }
    default:
      return state;
  }
}