import "./App.css";
import { RadarPersonData } from "@kannydennedy/dreams-2020-types";
import { GraphType } from "./ducks/ui";
import { RadarGraph } from "./radar-graph/radar-graph";

type AppInnerProps = {
  showingGraph: GraphType;
  width: number;
  radarGraphData: RadarPersonData[];
  activeDreamers: string[];
  fullScreen: boolean;
};

function AppInner({
  showingGraph,
  width,
  radarGraphData,
  activeDreamers,
  fullScreen,
}: AppInnerProps) {
  return (
    <>
      {showingGraph === "radar" && (
        <RadarGraph
          defaultActiveDreamers={activeDreamers}
          data={radarGraphData}
          width={width}
          fullScreen={fullScreen}
        />
      )}
    </>
  );
}

export default AppInner;
