import { createSlice, PayloadAction, Dispatch } from "@reduxjs/toolkit";
import { AppThunk } from "./store";
import { RootState } from "./root-reducer";
import {
  Granularity,
  ComparisonSet,
  GranularityComparisonCollection,
  DifferenceByGranularity,
  SingleTextRecordDictionary,
  DifferenceDisplayRecordWithExamples,
  ColumnGraphData,
  RadarPersonData,
} from "@kannydennedy/dreams-2020-types";

export type ComparisonCollectionByGranularity = {
  [key in Granularity]: GranularityComparisonCollection;
};

export type ComparisonSets = {
  granularity: Granularity;
  comparisonSets: ComparisonSet[];
};

// The maximum time index distance for a given granularity
// E.g. month: 6 would be 6 months
export const MAX_DISTANCE_BETWEEN_TIME_PERIODS: { [key in Granularity]: number } = {
  day: 2,
  week: 3,
  month: 6,
  year: 30,
};

export type DataState = {
  loading: boolean;
  comparisons?: ComparisonCollectionByGranularity;
  differences?: DifferenceByGranularity;
  columnData?: ColumnGraphData[];
  barData?: DifferenceDisplayRecordWithExamples;
  dreams?: SingleTextRecordDictionary;
  news?: SingleTextRecordDictionary;
  radarData?: RadarPersonData[];
};

const initialState: DataState = {
  loading: true,
  comparisons: undefined,
  differences: undefined,
  columnData: undefined,
  barData: undefined,
  dreams: undefined,
  news: undefined,
  radarData: undefined,
};

const dataSlice = createSlice({
  initialState,
  name: "species",
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setComparisons(state, action: PayloadAction<ComparisonCollectionByGranularity>) {
      state.comparisons = action.payload;
    },
    setDifferences(state, action: PayloadAction<DifferenceByGranularity>) {
      state.differences = action.payload;
    },
    setColumnData(state, action: PayloadAction<ColumnGraphData[]>) {
      state.columnData = action.payload;
    },
    setBarData(state, action: PayloadAction<DifferenceDisplayRecordWithExamples>) {
      state.barData = action.payload;
    },
    setDreams(state, action: PayloadAction<SingleTextRecordDictionary>) {
      state.dreams = action.payload;
    },
    setNews(state, action: PayloadAction<SingleTextRecordDictionary>) {
      state.news = action.payload;
    },
    setRadarData(state, action: PayloadAction<RadarPersonData[]>) {
      state.radarData = action.payload;
    },
  },
});

export default dataSlice;

// ----------------------------------------------------------------------------
// Selectors

export const selectComparisons = (
  state: RootState
): ComparisonCollectionByGranularity | undefined => {
  return state?.data.comparisons;
};

export const selectDifferences = (
  state: RootState
): DifferenceByGranularity | undefined => {
  return state?.data.differences;
};

export const selectColumnData = (state: RootState): ColumnGraphData[] | undefined => {
  return state?.data.columnData;
};

export const selectBarData = (
  state: RootState
): DifferenceDisplayRecordWithExamples | undefined => {
  return state?.data.barData;
};

export const selectDreams = (
  state: RootState
): SingleTextRecordDictionary | undefined => {
  return state?.data.dreams;
};

export const selectNews = (state: RootState): SingleTextRecordDictionary | undefined => {
  return state?.data.news;
};

export const selectRadarData = (state: RootState): RadarPersonData[] | undefined => {
  return state?.data.radarData;
};

// Get the comparison sets for a given granularity
export const selectComparisonsByGranularity = (
  granularity: Granularity,
  state: RootState
): GranularityComparisonCollection => {
  if (state.data.comparisons) {
    return state.data.comparisons[granularity];
  } else {
    return {
      granularity: granularity,
      maxSimilarity: 1,
      minSimilarity: 0,
      maxWordCount: 100,
      minWordCount: 1,
      comparisonSets: [],
    };
  }
};

export const selectIsLoading = (state: RootState): boolean => {
  return state?.data.loading;
};

// ----------------------------------------------------------------------------
// Thunks

// Files and their associated granularity
const files = [
  {
    name: "monthComparisons.json",
    granularity: "month",
  },
  {
    name: "weekComparisons.json",
    granularity: "week",
  },
];

// Loads the data from the files
export function fetchBubbleData(): AppThunk {
  console.log("Fetching bubble data");

  return async (dispatch: Dispatch) => {
    dispatch(dataSlice.actions.setLoading(true));

    // Months
    const allData = await Promise.all(
      files.map(async file => {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/${file.name}`);
        const data = await response.json();
        return data;
      })
    );

    const allComparisonsMap: ComparisonCollectionByGranularity = allData.reduce(
      (acc, curr, i) => {
        return {
          ...acc,
          [files[i].granularity]: curr,
        };
      },
      {} as ComparisonCollectionByGranularity
    );

    dispatch(dataSlice.actions.setComparisons(allComparisonsMap));
    dispatch(dataSlice.actions.setLoading(false));
  };
}

const differencesFile = "differences.json";
const columnFile = "month-columns.json";
const barFile = "bar-data.json";
const dreamsFile = "all-dreams-final.json";
const newsFile = "all-news-final.json";
const radarFile = "baselines.json";

// Loads the differences from the file
export function fetchAreaData(): AppThunk {
  return async (dispatch: Dispatch) => {
    dispatch(dataSlice.actions.setLoading(true));

    const response = await fetch(`${process.env.PUBLIC_URL}/data/${differencesFile}`);
    const data = await response.json();

    dispatch(dataSlice.actions.setDifferences(data));
    dispatch(dataSlice.actions.setLoading(false));
  };
}

// // Loads the differences from the file
export function fetchColumnData(): AppThunk {
  return async (dispatch: Dispatch) => {
    dispatch(dataSlice.actions.setLoading(true));

    const response = await fetch(`${process.env.PUBLIC_URL}/data/${columnFile}`);
    const data = await response.json();

    dispatch(dataSlice.actions.setColumnData(data));
    dispatch(dataSlice.actions.setLoading(false));
  };
}

// Loads bar data from the file
export function fetchBarData(): AppThunk {
  return async (dispatch: Dispatch) => {
    dispatch(dataSlice.actions.setLoading(true));

    const response = await fetch(`${process.env.PUBLIC_URL}/data/${barFile}`);
    const data = await response.json();

    dispatch(dataSlice.actions.setBarData(data));
    dispatch(dataSlice.actions.setLoading(false));
  };
}

// Load dreams from the file
export function fetchDreams(): AppThunk {
  return async (dispatch: Dispatch) => {
    dispatch(dataSlice.actions.setLoading(true));

    const response = await fetch(`${process.env.PUBLIC_URL}/data/${dreamsFile}`);
    const data = await response.json();

    dispatch(dataSlice.actions.setDreams(data));
    dispatch(dataSlice.actions.setLoading(false));
  };
}

// Load news from the file
export function fetchNews(): AppThunk {
  return async (dispatch: Dispatch) => {
    dispatch(dataSlice.actions.setLoading(true));

    const response = await fetch(`${process.env.PUBLIC_URL}/data/${newsFile}`);
    const data = await response.json();

    dispatch(dataSlice.actions.setNews(data));
    dispatch(dataSlice.actions.setLoading(false));
  };
}

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
