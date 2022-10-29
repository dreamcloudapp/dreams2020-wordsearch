import { combineReducers, AnyAction } from "@reduxjs/toolkit";
import dataSlice, { DataState } from "./data";
import uiSlice, { UIState } from "./ui";
import { useSelector as useReduxSelector, TypedUseSelectorHook } from "react-redux";

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

type GlobalState =
  | {
      data: DataState;
      ui: UIState;
    }
  | undefined;

const appReducer = combineReducers({
  data: dataSlice.reducer,
  ui: uiSlice.reducer,
});

export const rootReducer = (state: GlobalState, action: AnyAction) => {
  return appReducer(state, action);
};

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
