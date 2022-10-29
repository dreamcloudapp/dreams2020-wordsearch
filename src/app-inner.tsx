import "./App.css";
import { RadarPersonData } from "@kannydennedy/dreams-2020-types";
import { GraphType } from "./ducks/ui";
import { Padding } from "./modules/ui-types";
import { RadarGraph } from "./radar-graph/radar-graph";

type AppInnerProps = {
  showingGraph: GraphType;
  width: number;
  height: number;
  handleMouseOver: (event: any, datum: any) => void;
  hideTooltip: () => void;
  radarGraphData: RadarPersonData[];
  padding: Padding;
};

function AppInner({
  showingGraph,
  width,
  height,
  handleMouseOver,
  hideTooltip,
  radarGraphData,
  padding,
}: AppInnerProps) {
  return (
    <>{showingGraph === "radar" && <RadarGraph data={radarGraphData} width={width} />}</>
  );
}

export default AppInner;
