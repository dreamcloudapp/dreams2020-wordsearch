const fs = require("fs");
const path = require("path");
const { isDotFile } = require("./modules/file-helpers");
const { getDifferenceInDays } = require("./modules/time-helpers");
import {
  DifferenceDictionary,
  DayRecord,
  NewsRecord,
  DifferenceRecord,
  DifferenceByGranularity,
} from "@kannydennedy/dreams-2020-types";
import {
  CONTROL_SET,
  SET2020,
  SET_2020_NAME,
  SRC_FOLDER,
  CONTROL_SET_NAME,
} from "./config";
import { ColorTheme } from "./modules/theme";

const YEAR = 2020;

////////////////////////////////////////////////////
// HELPER FUNCTIONS
////////////////////////////////////////////////////
const differenceDictToArray = (
  dict: DifferenceDictionary,
  maxDifference = 9999,
  minDifference = -9999
): { differences: DifferenceRecord[] } => {
  // Convert the day dictionary to an array
  const arr: DifferenceRecord[] = Object.keys(dict).map((key: string) => {
    return {
      difference: parseInt(key),
      averageSimilarity: dict[key].average,
      recordCount: dict[key].recordCount,
      numComparisons: dict[key].numComparisons,
    };
  });

  // Sort the array by difference
  const sortedArr = arr.sort((a: DifferenceRecord, b: DifferenceRecord) => {
    return a.difference - b.difference;
  });

  // Filter out the differences that are outside the range
  const filteredArr = sortedArr.filter((difference: DifferenceRecord) => {
    return (
      difference.difference >= minDifference && difference.difference <= maxDifference
    );
  });

  return { differences: filteredArr };
};

////////////////////////////////////////////////////
// MAIN
////////////////////////////////////////////////////

const setNames = [SET2020, CONTROL_SET];

type DataSet = {
  maxSimilarity: number;
  minSimilarity: number;
  differenceDictionary: DifferenceDictionary;
};

const allData: { [key: string]: DataSet } = {
  [SET2020]: {
    maxSimilarity: 0,
    minSimilarity: 1,
    differenceDictionary: {},
  },
  [CONTROL_SET]: {
    maxSimilarity: 0,
    minSimilarity: 1,
    differenceDictionary: {},
  },
};

// Open all the files in source data one by one
const files = fs.readdirSync(path.join(__dirname, SRC_FOLDER));

files.forEach((file: any) => {
  const filePath = path.join(__dirname, SRC_FOLDER, file);
  const fileData = fs.readFileSync(filePath, "utf8");

  // Check if the file is empty, and if so, skip it
  if (fileData.length === 0) {
    return;
  }
  // Check if the file is a dot file, and if so, skip it
  if (isDotFile(filePath)) {
    return;
  }

  // Parse the file data
  const parsedFileData: DayRecord = JSON.parse(fileData);

  // Get the set that it belongs to
  const setName = parsedFileData.dreamSetName;

  //  If the setName is not in setNames, return
  if (!setNames.includes(setName)) {
    console.log(`"${setName}" is not in setNames`);
    return;
  }

  const dreamSetDate = new Date(`${YEAR}-${parsedFileData.dreamSetDate}`);
  const dreamSetSize = parsedFileData.dreamSetSize;

  // Loop over the news records in the file
  parsedFileData.newsRecords.forEach((newsRecord: NewsRecord) => {
    const { similarity, date: newsDateString, recordSize } = newsRecord;

    // Update max and min similarity
    if (similarity > allData[setName].maxSimilarity) {
      allData[setName].maxSimilarity = similarity;
    }
    if (similarity < allData[setName].minSimilarity) {
      allData[setName].minSimilarity = similarity;
    }

    const newsDate = new Date(`${YEAR}-${newsDateString}`);

    // Get the difference, in days, between the news date and the dream set date
    const daysDifference = getDifferenceInDays(newsDate, dreamSetDate);

    const key = `${daysDifference}`;

    const dictionaryOfSet = allData[setName].differenceDictionary;

    // Add to day dictionary
    if (!dictionaryOfSet[key]) {
      dictionaryOfSet[key] = {
        average: similarity,
        recordCount: 1,
        numComparisons: dreamSetSize * recordSize,
      };
    } else {
      const { average: oldAverage, recordCount: oldRecordCount } = dictionaryOfSet[key];

      const newRecordCount = oldRecordCount + 1;

      const newAverage = (oldAverage * oldRecordCount + similarity) / newRecordCount;

      dictionaryOfSet[key] = {
        average: newAverage,
        recordCount: newRecordCount,
        numComparisons: dictionaryOfSet[key].numComparisons + dreamSetSize * recordSize,
      };
    }
  });
});

const dayDifferences2020 = differenceDictToArray(
  allData[SET2020].differenceDictionary,
  179,
  -179
);
const maxAverageSimilarity2020 = Math.max(
  ...dayDifferences2020.differences.map(d => d.averageSimilarity)
);

const dayDifferencesControl = differenceDictToArray(
  allData[CONTROL_SET].differenceDictionary,
  179,
  -179
);

const maxAverageSimilarityControl = Math.max(
  ...dayDifferencesControl.differences.map(d => d.averageSimilarity)
);

console.log(maxAverageSimilarity2020);

const data: DifferenceByGranularity = {
  day: [
    {
      key: SET_2020_NAME,
      color: ColorTheme.RED,
      comparisons: {
        differences: dayDifferences2020.differences,
        maxSimilarity: allData[SET2020].maxSimilarity,
        minSimilarity: allData[SET2020].minSimilarity,
        maxAverageSimilarity: maxAverageSimilarity2020,
      },
    },
    // Not including control set for now
    // {
    //   key: CONTROL_SET_NAME,
    //   color: ColorTheme.BLUE,
    //   comparisons: {
    //     differences: dayDifferencesControl.differences,
    //     maxSimilarity: allData[CONTROL_SET].maxSimilarity,
    //     minSimilarity: allData[CONTROL_SET].minSimilarity,
    //     maxAverageSimilarity: maxAverageSimilarityControl,
    //   },
    // },
  ],
  week: [
    {
      key: SET_2020_NAME,
      color: ColorTheme.RED,
      comparisons: {
        differences: [],
        maxSimilarity: 1,
        minSimilarity: 0,
        maxAverageSimilarity: 1,
      },
    },
  ],
  month: [
    {
      key: "2020",
      color: ColorTheme.RED,
      comparisons: {
        differences: [],
        maxSimilarity: 1,
        minSimilarity: 0,
        maxAverageSimilarity: 1,
      },
    },
  ],
  year: [
    {
      key: "2020",
      color: ColorTheme.RED,
      comparisons: {
        differences: [],
        maxSimilarity: 1,
        minSimilarity: 0,
        maxAverageSimilarity: 1,
      },
    },
  ],
};

// Print the dicitonary to JSON
const json = JSON.stringify(data, null, 2);
fs.writeFileSync(path.join(__dirname, "../public/data/differences.json"), json);

export {};
