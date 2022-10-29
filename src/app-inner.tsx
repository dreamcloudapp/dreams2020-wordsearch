import "./App.css";
import { BubbleGraphContainer } from "./bubble-graph/bubble-graph-container";
import { AreaGraphContainer } from "./area-graph/area-graph-container";
import { ColumnGraphContainer } from "./column-graph/column-graph-container";
import {
  ColumnGraphData,
  DifferenceByGranularity,
  DifferenceDisplayRecordWithExamples,
  GranularityComparisonCollection,
  RadarPersonData,
} from "@kannydennedy/dreams-2020-types";
import { GraphType } from "./ducks/ui";
import { BarGraphContainer } from "./bar-graph/bar-graph-container";
import { Padding } from "./modules/ui-types";
import { RadarGraph } from "./radar-graph/radar-graph";

type AppInnerProps = {
  showingGraph: GraphType;
  width: number;
  height: number;
  handleMouseOver: (event: any, datum: any) => void;
  hideTooltip: () => void;
  bubbleData: GranularityComparisonCollection;
  diffData: DifferenceByGranularity;
  columnGraphData: ColumnGraphData[];
  barGraphData: DifferenceDisplayRecordWithExamples;
  radarGraphData: RadarPersonData[];
  padding: Padding;
};

function AppInner({
  showingGraph,
  width,
  height,
  handleMouseOver,
  hideTooltip,
  bubbleData,
  diffData,
  columnGraphData,
  barGraphData,
  radarGraphData,
  padding,
}: AppInnerProps) {
  return (
    <>
      {showingGraph === "area" && (
        <AreaGraphContainer
          data={diffData}
          width={width}
          height={height}
          handleMouseOver={handleMouseOver}
          onMouseOut={hideTooltip}
          padding={padding}
        />
      )}
      {showingGraph === "bubble" && (
        <BubbleGraphContainer
          data={bubbleData}
          width={width}
          height={height}
          handleMouseOver={handleMouseOver}
          onMouseOut={hideTooltip}
          padding={padding}
        />
      )}
      {showingGraph === "column" && (
        <ColumnGraphContainer
          data={columnGraphData}
          width={width}
          height={height}
          handleMouseOver={handleMouseOver}
          onMouseOut={hideTooltip}
          padding={padding}
        />
      )}
      {showingGraph === "bar" && (
        <BarGraphContainer
          data={barGraphData}
          width={width}
          height={height}
          handleMouseOver={handleMouseOver}
          onMouseOut={hideTooltip}
          padding={padding}
        />
      )}
      {showingGraph === "radar" && <RadarGraph data={radarGraphData} width={width} />}
    </>
  );
}

export default AppInner;
