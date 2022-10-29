import { useEffect, useRef } from "react";
import "./App.css";
import { useSelector } from "./ducks/root-reducer";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { selectIsLoading, selectRadarData, fetchRadarData } from "./ducks/data";
import { useDispatch } from "react-redux";
import { selectShowingGraph, setShowingGraph } from "./ducks/ui";
import useComponentSize from "@rehooks/component-size";
import { localPoint } from "@visx/event";
import { Padding } from "./modules/ui-types";
import { ChartOpts } from ".";
import AppInner from "./app-inner";

const padding: Padding = {
  LEFT: 50,
  RIGHT: 30,
  TOP: 60,
  BOTTOM: 100,
};

function App({
  activeChart = "radar",
  showAll = true,
  activeDreamers = ["Baselines F", "Baselines M"],
}: ChartOpts) {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const showingGraph = useSelector(selectShowingGraph);
  const radarData = useSelector(selectRadarData);

  // Get width and height
  const graphContainerRef = useRef<HTMLDivElement>(null);
  let { width, height } = useComponentSize(graphContainerRef);

  // Tooltip
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } =
    useTooltip();

  // If you don't want to use a Portal, simply replace `TooltipInPortal` below with
  // `Tooltip` or `TooltipWithBounds` and remove `containerRef`
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    // use TooltipWithBounds
    detectBounds: true,
    // when tooltip containers are scrolled, this will correctly update the Tooltip position
    scroll: true,
  });

  const handleMouseOver = (event: any, datum: any) => {
    const coords = localPoint(event.target.ownerSVGElement, event);
    showTooltip({
      tooltipLeft: coords?.x,
      tooltipTop: coords?.y,
      tooltipData: datum,
    });
  };

  // Initial data fetch
  useEffect(() => {
    dispatch<any>(fetchRadarData());
  }, [dispatch]);

  // Set the active chart based on props
  useEffect(() => {
    dispatch(setShowingGraph(activeChart));
  }, [dispatch, activeChart]);

  const frameWidth = window.location.href.includes("localhost") ? 20 : 0;
  const maxWidth = window.location.href.includes("localhost")
    ? "calc(100% - 40px)"
    : "90rem";

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          width: "100%",
          position: "relative",
          height: showingGraph === "radar" ? "auto" : 600,
          padding: frameWidth,
          maxWidth: maxWidth,
        }}
      >
        <div
          className="App"
          style={{ height: "100%", width: "100%", border: "1px solid #EEE" }}
        >
          <div style={{ height: "100%", width: "100%" }} ref={graphContainerRef}>
            <div
              style={{ height: "100%", width: "100%", position: "relative" }}
              ref={containerRef}
            >
              {(isLoading || !width || width < 1) && <div>Loading...</div>}
              {!isLoading && radarData && (
                <AppInner
                  height={height}
                  width={width}
                  showingGraph={showingGraph}
                  handleMouseOver={handleMouseOver}
                  hideTooltip={hideTooltip}
                  radarGraphData={radarData}
                  padding={padding}
                  activeDreamers={activeDreamers}
                />
              )}
            </div>
          </div>
        </div>

        {tooltipOpen && (
          <TooltipInPortal
            // set this to random so it correctly updates with parent bounds
            key={Math.random()}
            top={tooltipTop}
            left={tooltipLeft}
          >
            <div style={{ maxWidth: 300, fontFamily: "Lato", fontWeight: 400 }}>
              <strong>{tooltipData}</strong>
            </div>
          </TooltipInPortal>
        )}
      </div>
    </div>
  );
}

export default App;
