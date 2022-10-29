import { scaleLinear } from "d3";
import { Padding } from "../modules/ui-types";
import { changeHslLightness } from "../modules/colorHelpers";
import { Bubble } from "./bubble";
import { MAX_DISTANCE_BETWEEN_TIME_PERIODS } from "../ducks/data";
import {
  Granularity,
  GranularityComparisonCollection,
  SimilarityLevel,
} from "@kannydennedy/dreams-2020-types";
import { useSelector } from "../ducks/root-reducer";
import {
  selectActiveGranularity,
  CollectionCheck,
  VisComparison,
  setFocusedComparison,
  selectActiveComparisonSet,
  setActiveComparisonSet,
} from "../ducks/ui";
import { useDispatch } from "react-redux";
import { BallOverlay } from "../ball/ball-overlay";
import { ColorTheme, RED_SIMILARITY_COLORS, SIMILARITY_COLORS } from "../modules/theme";
import { XYAxis } from "../axes/xy-axis";
import { Tooltip } from "../tooltip/tooltip-inner";

type BubbleGraphProps = {
  data: GranularityComparisonCollection;
  maxTimeDistance: number; // We only show comparisons that fall within this range
  width: number;
  height: number;
  handleMouseOver: (event: any, datum: any) => void;
  checkedCollections: CollectionCheck[];
  hideTooltip: () => void;
  focusedComparison: VisComparison | null;
  prevFocusedComparison: VisComparison | null;
  padding: Padding;
};

const getXDomain = (granularity: Granularity): [number, number] => {
  const maxDist = MAX_DISTANCE_BETWEEN_TIME_PERIODS[granularity];
  return [maxDist * -1, maxDist];
};

const LINE_WIDTH = 2;

export function BubbleGraph({
  data,
  width,
  height,
  maxTimeDistance,
  handleMouseOver,
  hideTooltip,
  focusedComparison,
  prevFocusedComparison,
  checkedCollections,
  padding,
}: BubbleGraphProps) {
  const dispatch = useDispatch();

  // We need to know the active granularity to determine the scale
  const activeGranularity = useSelector(selectActiveGranularity);
  const activeComparisonSet = useSelector(selectActiveComparisonSet);

  const paddedMax = activeGranularity === "month" ? 0.028 : 0.035;

  // Domain & range for the x-axis
  const xDomain = getXDomain(activeGranularity);
  const xRange = [0, width - padding.LEFT - padding.RIGHT];

  const scaleY = scaleLinear()
    .domain([0, paddedMax])
    .range([height - padding.BOTTOM, padding.TOP]);

  const scaleXDiscrete = scaleLinear().domain(xDomain).range(xRange);

  // Size of the balls is determined by the number of comparisons
  // Should also take into account graph dimensions
  const maxComparisons = activeGranularity === "week" ? 30000 : 350000;
  const scaleBallSize = scaleLinear()
    .domain([0, maxComparisons])
    .range([0, height / 50]);

  return (
    <svg width={width} height={height}>
      <XYAxis
        width={width}
        height={height}
        padding={padding}
        hasMidpointLine={true}
        yRange={[0, paddedMax]}
        xRange={xDomain}
        numTicks={7}
        xAxisCenterLabel=""
        xAxisFormat={d => {
          const plural = Math.abs(d) > 1 ? "s" : "";
          if (d === 0) {
            return `Same ${activeGranularity}`;
          } else {
            return `${d} ${activeGranularity}${plural}`;
          }
        }}
      />

      {data.comparisonSets.map((comparisonSet, setIndex) => {
        return comparisonSet.comparisons.map((comparison, i) => {
          const { dreamCollection, newsCollection, score, numComparisons } = comparison;

          const index1 = dreamCollection.timePeriod.index;
          const index2 = newsCollection.timePeriod.index;

          const startPoint: [number, number] = [width / 2, height / 2];
          const endY = scaleY(score);
          const endX = padding.LEFT + scaleXDiscrete(index1 - index2);

          return (
            <Bubble
              startPoint={startPoint}
              endPoint={[endX, endY]}
              key={i}
              r={scaleBallSize(numComparisons)}
              stroke={changeHslLightness(comparisonSet.color, -10)}
              strokeWidth={LINE_WIDTH}
              fill={comparisonSet.color}
              onMouseOver={e => {
                (handleMouseOver as any)(
                  e,
                  <Tooltip
                    tipTitle={comparison.label}
                    sections={[
                      {
                        rows: [
                          {
                            key: "Average similarity:",
                            value: comparison.score.toFixed(5),
                          },
                          {
                            key: "Total dream-news pairs compared:",
                            value: comparison.numComparisons.toLocaleString(),
                          },
                        ],
                      },
                    ]}
                  />
                );
              }}
              opacity={
                checkedCollections.find(c => c.label === comparisonSet.label)?.checked
                  ? focusedComparison
                    ? 0.2
                    : 1
                  : 0
              }
              onMouseOut={hideTooltip}
              onClick={() => {
                const colorTheme =
                  comparisonSet.color === ColorTheme.BLUE
                    ? SIMILARITY_COLORS
                    : RED_SIMILARITY_COLORS;

                const highMedLowComparisons: VisComparison[] = Object.entries(
                  comparison.similarityExamples || {}
                ).map(([level, comparison], i) => {
                  return {
                    x: endX,
                    y: endY,
                    index: i,
                    color: colorTheme[level as SimilarityLevel],
                    concepts: comparison.concepts.map(c => c.title),
                    startRadius: scaleBallSize(numComparisons),
                    label: `Example ${level} similarity comparison`,
                    dreamId: comparison.dreamId,
                    newsId: comparison.newsId,
                    subLabel: "testing",
                  };
                });

                // Don't do anything if there are no examples
                if (
                  !comparison.similarityExamples ||
                  !comparison.similarityExamples.high.score
                ) {
                  return;
                }

                dispatch(setActiveComparisonSet(highMedLowComparisons));
                dispatch(setFocusedComparison(highMedLowComparisons[0]));
              }}
            />
          );
        });
      })}
      {/* Overlay with focused balls (may be null) */}
      {/* Don't show this if there's no info in the focused comparison */}
      <BallOverlay
        width={width}
        height={height}
        prevFocusedComparison={prevFocusedComparison}
        focusedComparison={focusedComparison}
        activeComparisonSet={activeComparisonSet}
      />
    </svg>
  );
}
