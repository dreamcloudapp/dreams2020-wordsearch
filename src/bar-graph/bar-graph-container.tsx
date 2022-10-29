import {
  DifferenceDisplayRecordWithExamples,
  DifferenceRecord,
  SimilarityLevel,
} from "@kannydennedy/dreams-2020-types";
import { Padding } from "../modules/ui-types";
import { scaleLinear } from "d3";
import "../App.css";
import { XYAxis } from "../axes/xy-axis";
import { prettyNumber, toTitleCase } from "../modules/formatters";
import { Column } from "../components/column";
import { useDispatch } from "react-redux";
import {
  selectActiveComparisonSet,
  selectFocusedComparison,
  selectPrevFocusedComparison,
  setActiveComparisonSet,
  setFocusedComparison,
  VisComparison,
} from "../ducks/ui";
import { BallOverlay } from "../ball/ball-overlay";
import { useSelector } from "../ducks/root-reducer";
import { SIMILARITY_COLORS } from "../modules/theme";
import { Tooltip, TooltipRow } from "../tooltip/tooltip-inner";
import { useState } from "react";

const BAR_GAP = 3;

type BarGraphProps = {
  data: DifferenceDisplayRecordWithExamples;
  padding: Padding;
  width: number;
  height: number;
  onMouseOut: () => void;
  handleMouseOver: (event: any, datum: any) => void;
};

const differenceIncrementToText = (difference: number): string => {
  const absoluteDifference = Math.abs(difference);

  let tooltipHeader = "";
  if (difference === 0) {
    tooltipHeader = "Dreams within 1 week after the news, including same day";
  } else if (difference > 0) {
    tooltipHeader = `Dreams within ${absoluteDifference + 1} weeks after the news`;
  } else if (difference === -1) {
    tooltipHeader = `Dreams within 1 week before the news`;
  } else if (difference < -1) {
    tooltipHeader = `Dreams within ${absoluteDifference} weeks before the news`;
  }

  return tooltipHeader;
};

const renderTooltip = (d: DifferenceRecord) => {
  const { difference, similarityLevels } = d;

  const tooltipHeader = differenceIncrementToText(difference);

  const mainRows: TooltipRow[] = [
    {
      key: "Average similarity:",
      value: prettyNumber(d.averageSimilarity, 5),
    },
    {
      key: "Total dream-news pairs compared:",
      value: prettyNumber(d.numComparisons, 0),
    },
  ];

  const similarityRows: TooltipRow[] = (similarityLevels || []).map((sLevel, i) => {
    const simLevelLabel =
      sLevel.similarityLevel === "medium"
        ? "Indicative"
        : toTitleCase(sLevel.similarityLevel);
    return {
      key: `${simLevelLabel} similarity pairs (>= ${sLevel.threshold}):`,
      value: prettyNumber(sLevel.percent, 1) + "%",
      keyColor: sLevel.color,
    };
  });
  const similarityRowsReversed = [...similarityRows.reverse()];

  return (
    <Tooltip
      tipTitle={tooltipHeader}
      sections={[
        {
          rows: [...mainRows, ...similarityRowsReversed],
        },
      ]}
    />
  );
};

export function BarGraphContainer({
  data,
  height,
  width,
  onMouseOut,
  handleMouseOver,
  padding,
}: BarGraphProps) {
  const dispatch = useDispatch();
  const focusedComparison = useSelector(selectFocusedComparison);
  const prevFocusedComparison = useSelector(selectPrevFocusedComparison);
  const activeComparisonSet = useSelector(selectActiveComparisonSet);

  const [focusedColIndex, setFocusedColIndex] = useState<number | null>(null);

  const numBars = data.comparisons.differences.length;
  const totalGap = (numBars - 1) * BAR_GAP;
  const barWidth = (width - totalGap - padding.LEFT - padding.RIGHT) / numBars;

  // const max = data.comparisons.maxAverageSimilarity;

  const paddedMax = 0.022;

  const scaleY = scaleLinear()
    .domain([0, paddedMax])
    .range([0, height - padding.TOP - padding.BOTTOM]);

  return (
    <svg width={width} height={height}>
      <XYAxis
        width={width}
        height={height}
        padding={padding}
        hasMidpointLine={false}
        yRange={[0, paddedMax]}
        xRange={[-numBars / 2, numBars / 2]}
        xAxisCenterLabel=""
        numTicks={11}
        barWidth={barWidth}
        barGap={BAR_GAP}
        xAxisFormat={d => {
          // If d is 0, it's 'within 1 week after the news', so it's 1
          if (d === 0) {
            return d + 1 + " week";
          } else if (d === -1) {
            return d + " week";
          } else if (d > 0) {
            return d + 1 + " weeks";
          } else {
            return d + " weeks";
          }
        }}
      />

      {data.comparisons.differences.map((difference, index) => {
        const x = (barWidth + BAR_GAP) * index + padding.LEFT;
        const barHeight = scaleY(difference.averageSimilarity);

        const y = height - padding.BOTTOM - barHeight;

        return (
          <Column
            key={index}
            x={x}
            y={y}
            focused={focusedColIndex === index}
            colWidth={barWidth}
            colHeight={barHeight}
            onMouseOver={e => {
              setFocusedColIndex(index);
              (handleMouseOver as any)(e, renderTooltip(difference));
            }}
            onMouseOut={() => {
              setFocusedColIndex(null);
              onMouseOut();
            }}
            sections={difference.similarityLevels || []}
            onClick={() => {
              const ballX = x + barWidth / 2;
              const ballY = y;
              const startRadius = 5;

              const subLabel = differenceIncrementToText(difference.difference);

              const highMedLowComparisons: VisComparison[] = Object.entries(
                difference.examples
              ).map(([level, comparison], i) => {
                return {
                  x: ballX,
                  y: ballY,
                  index: i,
                  color: SIMILARITY_COLORS[level as SimilarityLevel],
                  concepts: comparison.concepts.map(c => c.title),
                  startRadius,
                  label: `Example ${level} similarity comparison`,
                  dreamId: comparison.dreamId,
                  newsId: comparison.newsId,
                  subLabel,
                };
              });

              // const newActiveComparisonSet: VisComparison[] = [
              //   mainComparison,
              //   ...highMedLowComparisons,
              // ];

              dispatch(setActiveComparisonSet(highMedLowComparisons));
              dispatch(setFocusedComparison(highMedLowComparisons[0]));
            }}
          />
        );
      })}
      {/* Overlay with focused balls (may be null) */}
      <BallOverlay
        width={width}
        height={height}
        prevFocusedComparison={prevFocusedComparison}
        focusedComparison={focusedComparison}
        activeComparisonSet={activeComparisonSet}
        header={focusedComparison?.subLabel}
      />
    </svg>
  );
}
