import * as actionTypes from '../constants/LocationConstants';
const initialState = {
  location: '',
};

// Why name function the same as the reducer?
// https://github.com/gaearon/redux/issues/428#issuecomment-129223274
// Naming the function will help with debugging!
export default function locationReducer(state = initialState, action) {
  const { type, name } = action;
  switch (type) {
    case actionTypes.LOCATION_UPDATE:
      return {
        lastActionType: type,
        location,
      };
    default:
      return state;
  }
}
