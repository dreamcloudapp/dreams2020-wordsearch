import { ContentCategory, RadarPersonData } from "@kannydennedy/dreams-2020-types";
import { useMemo, useState } from "react";
import Legend from "../legend";
import { CollectionCheck } from "../ducks/ui";
import {
  RadarChart as RadarVis,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import { toTitleCase } from "../modules/formatters";

const allRadarChartNames: ContentCategory[] = [
  "perception",
  "emotion",
  "characters",
  "social interactions",
  "movement",
  "cognition",
  "culture",
  "elements",
];

const CHART_MARGIN = 10;

type RadarGraphProps = {
  data: RadarPersonData[];
  width: number;
  defaultActiveDreamers: string[];
};

export function RadarGraph({ data, width, defaultActiveDreamers }: RadarGraphProps) {
  const numGraphsPerRow = width < 600 ? 1 : width < 1000 ? 2 : width < 1200 ? 3 : 4;

  // Dummy
  const radarWidth = width / numGraphsPerRow - CHART_MARGIN * 2;

  // Initial state is based on defaultActiveDreamers
  const [showingPeople, setShowingPeople] = useState<CollectionCheck[]>(
    data.map((person, i) => {
      return {
        label: person.name,
        checked: defaultActiveDreamers.includes(person.name),
        color: person.meta.color,
      };
    })
  );

  // We need to return an array of arrays, e.g.
  // const x = [
  //   {
  //     title: "Perception",
  //     radarData: [
  //       {
  //         radarseg: "Math",
  //         mary: 120,
  //         john: 110,
  //         fullMark: 150,
  //       },
  //       {
  //         radarseg: "Chinese",
  //         mary: 120,
  //         john: 110,
  //         fullMark: 150,
  //       },
  //     ],
  //   },
  // ];
  const rechartsRadarData = useMemo(() => {
    return allRadarChartNames.map((chartCategory, i) => {
      const name: string = chartCategory;
      const activePeople = data.filter((_, i) => showingPeople[i].checked);

      // Radar data is an array of objects, where each object is a radar segment
      const radarData: any = Object.keys(activePeople[0].data[chartCategory]).map(key => {
        const ret = {
          radarseg: key,
        };
        activePeople.forEach((person, i) => {
          (ret as any)[person.name] = Math.floor(person.data[chartCategory][key] * 100);
        });
        return ret;
      });

      return {
        title: name,
        radarData,
      };
    });
  }, [data, showingPeople]);

  const handleCheck = (label: string) => {
    // If every label is checked
    // Uncheck everything except for the one that was clicked
    if (showingPeople.every(p => p.checked)) {
      setShowingPeople(
        showingPeople.map(p => {
          return {
            ...p,
            checked: p.label === label,
          };
        })
      );
    }
    // If the last label is being unchecked
    // Check everything
    else if (
      showingPeople.filter(p => p.checked).length === 1 &&
      showingPeople.find(p => p.label === label)?.checked
    ) {
      setShowingPeople(
        showingPeople.map(p => {
          return {
            ...p,
            checked: true,
          };
        })
      );
    } else {
      setShowingPeople(
        showingPeople.map(p => {
          if (p.label === label) {
            return {
              ...p,
              checked: !p.checked,
            };
          }
          return p;
        })
      );
    }
  };

  return (
    <div style={{ paddingTop: 50 }}>
      <div style={{ marginBottom: "3rem" }}>
        <Legend checkedCollections={showingPeople} handleCheck={handleCheck} />
      </div>
      {rechartsRadarData.map((radar, i) => {
        const { radarData } = radar;

        const allVals = radarData.map((x: any) => Object.values(x)).flat();
        const numericVals: number[] = allVals
          .filter((x: any) => typeof x === "number")
          .map((x: any) => x as number);
        const maxPercent = Math.max(...numericVals);
        const radarMax =
          maxPercent > 80
            ? 100
            : maxPercent > 60
            ? 80
            : maxPercent > 40
            ? 60
            : maxPercent > 20
            ? 40
            : maxPercent > 8
            ? 20
            : 8;

        return (
          <div
            key={i}
            style={{
              margin: CHART_MARGIN,
              display: "inline-block",
              fontSize: "0.8rem",
            }}
          >
            <h3 style={{ fontWeight: "bold", margin: 0 }}>{toTitleCase(radar.title)}</h3>
            <RadarVis
              outerRadius={90}
              width={radarWidth}
              height={radarWidth}
              data={radar.radarData}
              onMouseEnter={x => {
                console.log(x);
              }}
              style={{ margin: 0 }}
            >
              <PolarGrid gridType="circle" />
              <PolarAngleAxis dataKey="radarseg" />
              <PolarRadiusAxis angle={90} domain={[0, radarMax]} />
              {showingPeople.map((person, i) => {
                return (
                  <Radar
                    key={i}
                    name={person.label}
                    dataKey={person.label}
                    stroke={person.color}
                    fill={person.color}
                    fillOpacity={0.6}
                  />
                );
              })}

              <Tooltip
                formatter={(value: any) => {
                  return value + "%";
                }}
              />
            </RadarVis>
          </div>
        );
      })}
    </div>
  );
}
