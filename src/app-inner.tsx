import "./App.css";
import { RadarPersonData } from "@kannydennedy/dreams-2020-types";
import { GraphType } from "./ducks/ui";
import { RadarGraph } from "./radar-graph/radar-graph";

type AppInnerProps = {
  showingGraph: GraphType;
  width: number;
  radarGraphData: RadarPersonData[];
  activeDreamers: string[];
};

function AppInner({
  showingGraph,
  width,
  radarGraphData,
  activeDreamers,
}: AppInnerProps) {
  return (
    <>
      {showingGraph === "radar" && (
        <RadarGraph
          defaultActiveDreamers={activeDreamers}
          data={radarGraphData}
          width={width}
        />
      )}
    </>
  );
}

export default AppInner;
