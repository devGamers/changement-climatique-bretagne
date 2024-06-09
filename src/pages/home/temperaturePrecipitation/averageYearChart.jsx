/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Chart from "../../../components/chart/chart";
import { calculateTrendLine, calculateZScores, identifyExtremes, tooltipRenderer } from "../../../helpers";

const TEMP_MIN = {
    type: "bar",
    xKey: "ANNEE",
    yKey: "TN",
    yName: "Température Minimale (°C et 1/10)",
    grouped: true,
    tooltip: {
      renderer: (params) => tooltipRenderer({ ...params, unite: '(°C et 1/10)' }),
    },
};

const TEMP_MAX = {
    type: "bar",
    xKey: "ANNEE",
    yKey: "TX",
    yName: "Température Maximale (°C et 1/10)",
    grouped: true,
    tooltip: {
        renderer: (params) => tooltipRenderer({ ...params, unite: '(°C et 1/10)' }),
    },
    showInMiniChart: true
};

const PRECIPITATION = {
    type: "line",
    xKey: "ANNEE",
    yKey: "RR",
    yName: "Précipitation (mm)",
    tooltip: {
      renderer: (params) => tooltipRenderer({ ...params, unite: '(mm et 1/10)' }),
    },
};

const BAR_AND_LINE = [
    { ...TEMP_MIN, type: "bar" },
    { ...TEMP_MAX, type: "bar" },
    { ...PRECIPITATION, type: "line" },
];

const AverageYearChart = props => {
    const {average, isLoading} = props
    let mounted = false

    const [options, setOptions] = useState({
        axes: [
            {type: "category", position: "bottom"},
            {
                // primary y axis
                type: "number",
                position: "left",
                keys: ["TX", "TN", "annotation"],
                title: {
                    text: "Températures",
                },
            },
            {
                // secondary y axis
                type: "number",
                position: "right",
                keys: ["RR", "trendRR"],
                title: {
                    text: "Précipitations",
                },
            },
        ],
    });

    useEffect(() => {
        if (!mounted && average.length) {
            // Calcul de la ligne de tendance pour les précipitations
            const trendData = calculateTrendLine(average, "ANNEE", "RR", "trendRR");

            // Calcul des z-scores pour identifier les anomalies
            const tempMaxZScores = calculateZScores(average, "TNTXM");
            const precipZScores = calculateZScores(average, "RR");

            // Identification des événements extrêmes
            const tempMaxExtremes = identifyExtremes(tempMaxZScores, "ANNEE", "TNTXM", 2, "Température"); // seuil de 2 z-scores pour les événements extrêmes
            const precipExtremes = identifyExtremes(precipZScores, "ANNEE", "RR", 2, "Précipitation");

            setOptions({
                ...options, 
                data: average, 
                series: [
                    ...BAR_AND_LINE,
                    {
                        type: "line",
                        xKey: "ANNEE",
                        yKey: "trendRR",
                        yName: "Tendance Précipitations",
                        data: trendData,
                        tooltip: {
                            renderer: (params) => tooltipRenderer({ ...params, unite: '(mm)' }),
                        },
                        stroke: "red",
                        lineDash: [5, 5],
                    },
                    {
                        type: "scatter",
                        xKey: "ANNEE",
                        yKey: "annotation",
                        data: [...tempMaxExtremes, ...precipExtremes],
                        labelKey: "label",
                        yName: "Annotations",
                        marker: {
                            shape: 'diamond',
                            size: 20,
                            fill: 'purple'
                        },
                        tooltip: {
                            renderer: ({ datum }) => ({ content: datum.label }),
                        }
                    }
                ],
            });
        }
        return () => mounted = true
    }, [average])

    return <Chart isLoading={isLoading} options={options} />
}

export default AverageYearChart
