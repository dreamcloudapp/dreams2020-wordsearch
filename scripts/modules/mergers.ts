import {
  WikipediaConcept,
  ExampleRecordComparison,
  ExampleDreamNewsComparison,
  ConceptScore,
  ExamplesWithSimilarityLevel,
} from "@kannydennedy/dreams-2020-types";
import { linkToTitle } from "../modules/string-helpers";
import { SIMILARITY_CUTOFFS } from "../config";

// Take a big list of wikipedia concepts and consolidate them into a smaller list
// First consolidate and sum the concepts with the same title
// Then sort the consolidated list by score
// Then return the top n concepts
export const consolidateWikipediaConceptList = (
  bigList: WikipediaConcept[],
  desiredLength: number
): WikipediaConcept[] => {
  // We need to consolidate the list of concepts
  // So there are no duplicates
  const consolidatedConceptsDict = bigList.reduce((acc, concept) => {
    // If the concept title includes the word "list", we ignore it
    // if (concept.title.toLowerCase().includes("list")) {
    //   return acc;
    // }

    if (acc[`${concept.title}`]) {
      return {
        ...acc,
        [`concept.title`]: {
          ...acc[`${concept.title}`],
          score: acc[`${concept.title}`].score + concept.score,
        },
      };
    } else {
      return {
        ...acc,
        [`${concept.title}`]: concept,
      };
    }
  }, {} as { [key: string]: WikipediaConcept });

  const consolidatedConceptsArr = Object.values(consolidatedConceptsDict);

  // Order list items by score
  // So we get the most relevant items first
  const sortedList = consolidatedConceptsArr.sort((a, b) => b.score - a.score);
  return sortedList.slice(0, desiredLength);
};

// This is a different way of getting the top concepts
// Rather than just consolidating all the concepts,
// We base it on examples
// This allows us to get the top of the relevant things
// Need to test this function
export const exampleListToTopConceptList = (
  exampleList: ExampleDreamNewsComparison[]
): WikipediaConcept[] => {
  // First, we order the examples
  const sortedList = exampleList.sort((a, b) => b.score - a.score);
  // Then we take the top 1/3, say
  const topThird = sortedList.slice(0, Math.floor(sortedList.length / 3));
  // Then, we get the concepts from each
  const topThirdConcepts = topThird.map(ex => ex.topConcepts).flat();
  // Then turn into a 'wikipedia' list
  const wikiTopConcepts: WikipediaConcept[] = topThirdConcepts.map(ex => ({
    // title: linkToTitle(ex.concept),
    title: ex.concept,
    score: ex.score,
  }));
  // Then we get the top ones
  const wikiList = consolidateWikipediaConceptList(wikiTopConcepts, 5);

  // Prettify and return
  return wikiList.map(example => ({
    score: example.score,
    title: linkToTitle(example.title),
  }));
};

export const consolidateExampleList = (
  bigList: ExampleRecordComparison[],
  desiredLength: number
): ExampleRecordComparison[] => {
  // Order list items by score
  // So we get the most relevant items first
  const sortedList = bigList.sort((a, b) => b.score - a.score);
  return sortedList.slice(0, desiredLength);
};

const cleanExampleList = (dirtyList: ConceptScore[]): WikipediaConcept[] => {
  return dirtyList
    .slice(0, 5)
    .map(example => ({ ...example, title: linkToTitle(example.concept) }));
};

// We're also kindof converting from Sheldon format here:/
export const consolidateDreamNewsComparisonExampleList = (
  bigList: ExampleDreamNewsComparison[]
): ExamplesWithSimilarityLevel => {
  // We can't show things when there's no concepts in common
  const listWithRealThings = bigList.filter(example => example.topConcepts.length > 0);
  // Order list items by score
  // So we get the most relevant items first

  const sortedList = listWithRealThings.sort((a, b) => b.score - a.score);

  // High is the top, indiscernible is the bottom
  const highEx = sortedList[0];
  const indiscernibleEx = sortedList[sortedList.length - 1];

  // To get the medium example
  // We want to find the example that's 'just below' the high score cutoff
  let mediumExIndex = 0;
  for (let i = 0; i < sortedList.length; i++) {
    if (sortedList[i].score < SIMILARITY_CUTOFFS.high) {
      mediumExIndex = i;
      break;
    }
  }
  const mediumEx = sortedList[mediumExIndex];

  // To get the low example
  // We want to find the example that's 'just below' the medium score cutoff
  let lowExIndex = 0;
  for (let i = 0; i < sortedList.length; i++) {
    if (sortedList[i].score < SIMILARITY_CUTOFFS.medium) {
      lowExIndex = i;
      break;
    }
  }
  const lowEx = sortedList[lowExIndex];

  const high: ExampleRecordComparison = {
    dreamId: highEx.doc1Id,
    newsId: highEx.doc2Id,
    concepts: cleanExampleList(highEx.topConcepts),
    score: highEx.score,
  };
  const medium: ExampleRecordComparison = {
    dreamId: mediumEx.doc1Id,
    newsId: mediumEx.doc2Id,
    concepts: cleanExampleList(mediumEx.topConcepts),
    score: mediumEx.score,
  };
  const low: ExampleRecordComparison = {
    dreamId: lowEx.doc1Id,
    newsId: lowEx.doc2Id,
    concepts: cleanExampleList(lowEx.topConcepts),
    score: lowEx.score,
  };
  const indiscernible: ExampleRecordComparison = {
    dreamId: indiscernibleEx.doc1Id,
    newsId: indiscernibleEx.doc2Id,
    concepts: cleanExampleList(indiscernibleEx.topConcepts),
    score: indiscernibleEx.score,
  };

  return {
    high,
    medium,
    low,
    indiscernible,
  };
};
