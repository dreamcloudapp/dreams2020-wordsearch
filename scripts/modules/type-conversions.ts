import {
  ComparisonSet,
  CollectionParams,
  WikipediaConcept,
  ExampleRecordComparison,
  OptionalConceptScore,
  ExampleDreamNewsComparison,
  NewsRecord,
} from "@kannydennedy/dreams-2020-types";
import { dummyConcepts } from "./dummy-data";
const { dayIndexFromDate } = require("./time-helpers");

// Function to capitalise the first letter of a string
const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Print dates like "Jan 1 2020"
const prettyPrintDate = (date: Date): string => {
  const month = capitalizeFirstLetter(date.toLocaleString("en-us", { month: "long" }));
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day} ${year}`;
};

// Convert a SheldonConcept to a WikipediaConcept
function sheldonConceptToWikipediaConcept(
  sheldonConcept: OptionalConceptScore
): WikipediaConcept {
  // If the concept is not present, return an empty object
  if (!sheldonConcept) {
    return {
      title: "",
      score: 0,
    };
  } else {
    // Get the title by taking everything after the last slash in sheldonConcept.concept
    const title = sheldonConcept.concept.split("/").pop() || "";
    // We're not using the link here, but we could get it via
    // `https://en.wikipedia.org/wiki/${title.replace(/\s/g, "_")}`,

    return {
      title: title,
      score: sheldonConcept.score,
    };
  }
}

// Convert Sheldon Example to ExampleRecordComparison
const sheldonExampleToExampleRecordComparison = (
  sheldonExample: ExampleDreamNewsComparison,
  numConceptsPerComparison: number
): ExampleRecordComparison => {
  const ret = {
    dreamId: sheldonExample.doc1Id, // TODO get the actual text
    newsId: sheldonExample.doc2Id, // TODO get the actual text
    score: sheldonExample.score,
    concepts: sheldonExample.topConcepts
      .slice(0, numConceptsPerComparison)
      .map(sheldonConceptToWikipediaConcept),
  };
  return ret;
};

// Convert a NewsRecord to a ComparisonSet
export const convertNewsRecordToDayComparisonSet = (
  record: NewsRecord,
  dreamDate: Date, // Each file has only one dream date, pass this in
  dreamSetSize: number, // Each file has only one dream set size, pass this in
  newsYear: number,
  numConceptsPerComparison: number,
  numExamplesPerComparison: number
): ComparisonSet => {
  // Get dates of set1 and set2
  const set1Date = dreamDate;
  const set2Date = new Date(`${newsYear}-${record.date}`);

  // Make collection1 and collection2
  // from set1 and set2
  // Assuming that 'set1' is dreams, and set2 is news
  const dreamCollection: CollectionParams = {
    label: "Dreams",
    timePeriod: {
      granularity: "day",
      index: dayIndexFromDate(set1Date),
      identifier: record.date + " - " + "dreams",
      start: set1Date,
      end: set1Date,
    },
  };

  const newsCollection: CollectionParams = {
    label: "News",
    timePeriod: {
      granularity: "day",
      index: dayIndexFromDate(set2Date),
      identifier: record.date + " - " + "news",
      start: set2Date,
      end: set2Date,
    },
  };

  const label = `Dreams from ${prettyPrintDate(set1Date)} vs. news from ${prettyPrintDate(
    set2Date
  )}`;

  const concepts = record.topConcepts
    .slice(0, numConceptsPerComparison)
    .map(sheldonConceptToWikipediaConcept);

  const examples = record.examples
    .slice(0, numExamplesPerComparison)
    .map(e => sheldonExampleToExampleRecordComparison(e, numConceptsPerComparison));

  // If the concepts are not present, it's a dummy run for speed
  // So return dummy concepts
  const shouldUseDummyConcepts = !concepts.length || concepts[0].score === 0;
  const conceptsToUse = shouldUseDummyConcepts ? dummyConcepts : concepts;

  return {
    id: record.date + "_" + newsYear,
    granularity: "day",
    label: label,
    score: record.similarity,
    wordCount: record.wordCount,
    dreamCollection,
    newsCollection,
    concepts: conceptsToUse,
    examples: examples,
    numComparisons: dreamSetSize * record.recordSize, // Num dreams * num news articles
    numDayComparisons: 1,
  };
};
