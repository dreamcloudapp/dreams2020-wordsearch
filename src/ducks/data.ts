import { createSlice, PayloadAction, Dispatch } from "@reduxjs/toolkit";
import { AppThunk } from "./store";
import { RootState } from "./root-reducer";
import { RadarPersonData } from "@kannydennedy/dreams-2020-types";

export type DataState = {
  loading: boolean;
  radarData?: RadarPersonData[];
};

const initialState: DataState = {
  loading: true,
  radarData: undefined,
};

const dataSlice = createSlice({
  initialState,
  name: "species",
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setRadarData(state, action: PayloadAction<RadarPersonData[]>) {
      state.radarData = action.payload;
    },
  },
});

export default dataSlice;

// ----------------------------------------------------------------------------
// Selectors

export const selectRadarData = (state: RootState): RadarPersonData[] | undefined => {
  return state?.data.radarData;
};

export const selectIsLoading = (state: RootState): boolean => {
  return state?.data.loading;
};

// ----------------------------------------------------------------------------
// Thunks

const radarFile = "baselines.json";

console.log(`"${process.env.PUBLIC_URL}"`);

// Load radar data from the file
export function fetchRadarData(): AppThunk {
  return async (dispatch: Dispatch) => {
    dispatch(dataSlice.actions.setLoading(true));

    const response = await fetch(`${process.env.PUBLIC_URL}/data/${radarFile}`);
    const data = await response.json();

    dispatch(dataSlice.actions.setRadarData(data));
    dispatch(dataSlice.actions.setLoading(false));
  };
}
