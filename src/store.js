import { createStore, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// actions
const ADD_RECORDING = 'ADD_RECORDING';
const DELETE_RECORDING = 'DELETE_RECORDING';
const SELECT_RECORDING = 'SELECT_RECORDING';
const SET_SERVER_DETAILS = 'SET_SERVER_DETAILS';
const ADD_CONVERTED_RECORDING = 'ADD_CONVERTED_RECORDING';
const DELETE_CONVERTED_RECORDING = 'DELETE_CONVERTED_RECORDING';

export const addRecording = (recording) => ({
  type: ADD_RECORDING,
  payload: recording,
});

export const deleteRecording = (uri) => ({
  type: DELETE_RECORDING,
  payload: uri,
});

export const selectRecording = (recording) => ({
  type: SELECT_RECORDING,
  payload: recording,
});

export const setServerDetails = (ip, port) => ({
  type: SET_SERVER_DETAILS,
  payload: { ip, port },
});

export const addConvertedRecording = (recording) => ({
  type: ADD_CONVERTED_RECORDING,
  payload: recording,
});

export const deleteConvertedRecording = (uri) => ({
  type: DELETE_CONVERTED_RECORDING,
  payload: uri,
});

// déclarations
const initialState = {
  recordings: [],
  convertedRecordings: [],
  selectedRecording: null,
  serverDetails: { ip: '', port: '' },
};

// actions dans le store
const audioReducer = (state = initialState, action) => {
  console.log('Action:', action);
  switch (action.type) {
    case ADD_RECORDING:
      return {
        ...state,
        recordings: [...state.recordings, action.payload],
      };
    case DELETE_RECORDING:
      return {
        ...state,
        recordings: state.recordings.filter(recording => recording.uri !== action.payload),
      };
    case SELECT_RECORDING:
      return {
        ...state,
        selectedRecording: action.payload,
      };
    case SET_SERVER_DETAILS:
      return {
        ...state,
        serverDetails: action.payload,
      };
    case ADD_CONVERTED_RECORDING:
      // sans la vérification, erreur d'asset
      console.log('State before ADD_CONVERTED_RECORDING:', state);
      console.log('Payload:', action.payload);
      if (!action.payload || !action.payload.uri) {
        console.error('Invalid payload for ADD_CONVERTED_RECORDING');
        return state;
      }
      return {
        ...state,
        convertedRecordings: state.convertedRecordings ? [...state.convertedRecordings, action.payload] : [action.payload],
      };
    case DELETE_CONVERTED_RECORDING:
      return {
        ...state,
        convertedRecordings: state.convertedRecordings.filter(recording => recording.uri !== action.payload),
      };
    default:
      return state;
  }
};


const rootReducer = combineReducers({
  audio: audioReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(persistedReducer);
const persistor = persistStore(store);

export { store, persistor };