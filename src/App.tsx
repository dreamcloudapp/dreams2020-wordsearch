import { useEffect, useRef, useState } from "react";
import "./App.css";
import { useSelector } from "./ducks/root-reducer";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { selectIsLoading, selectRadarData, fetchRadarData } from "./ducks/data";
import { useDispatch } from "react-redux";
import { selectShowingGraph, setShowingGraph } from "./ducks/ui";
import useComponentSize from "@rehooks/component-size";
import { ChartOpts } from ".";
import AppInner from "./app-inner";
import { FullScreenButton } from "./components/fullscreen-btn";
import { detect } from "detect-browser";
import screenfull from "screenfull";

const APP_ID = "dreams-2020-radar-charts";

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
  let { width } = useComponentSize(graphContainerRef);

  // FULLSCREEN THINGS
  // Detect browser
  // Fullscreen button is disabled for ios
  const [isFullscreen, setIsFullscreen] = useState(false);
  const browser = detect();
  const isIos = browser?.os === "iOS";
  const canFullscreen = !isIos;
  const toggleFullscreen = () => {
    const elem = document.getElementById(APP_ID);
    const isScreenfull = screenfull.isEnabled && screenfull.isFullscreen;
    setIsFullscreen(!isScreenfull);
    if (elem) {
      if (screenfull.isEnabled) {
        screenfull.toggle(elem);
      }
    }
  };

  // Tooltip
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen } = useTooltip();

  // If you don't want to use a Portal, simply replace `TooltipInPortal` below with
  // `Tooltip` or `TooltipWithBounds` and remove `containerRef`
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    // use TooltipWithBounds
    detectBounds: true,
    // when tooltip containers are scrolled, this will correctly update the Tooltip position
    scroll: true,
  });

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
    <div style={{ width: "100%" }} className="dreams-2020-chart" id={APP_ID}>
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
          style={{
            height: "100%",
            width: "100%",
            border: "1px solid #EEE",
            position: "relative",
          }}
        >
          <div style={{ height: "100%", width: "100%" }} ref={graphContainerRef}>
            <div
              style={{ height: "100%", width: "100%", position: "relative" }}
              ref={containerRef}
            >
              {(isLoading || !width || width < 1) && <div>Loading...</div>}
              {!isLoading && radarData && (
                <AppInner
                  width={width}
                  showingGraph={showingGraph}
                  radarGraphData={radarData}
                  activeDreamers={activeDreamers}
                  fullScreen={isFullscreen}
                />
              )}
            </div>
          </div>
          {canFullscreen && (
            <FullScreenButton isFullscreen={isFullscreen} onClick={toggleFullscreen} />
          )}
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
