/* eslint-disable react-hooks/exhaustive-deps */
import {useState, useEffect} from 'react'
import Chart from '../../../components/chart/chart';
import { mois } from '../../../constants';
import { calculateTrendLine, calculateZScores, identifyExtremes, tooltipRenderer } from '../../../helpers';

const AverageMonthChart = props => {
    const {average, isLoading} = props
    let mounted = false

    const [options, setOptions] = useState({
        axes: [
            {
              type: 'category',
              position: 'bottom',
              label: {
                formatter: (params) => mois[params.value - 1].court,
              },
            },
            {
              type: 'number',
              position: 'left',
              keys: ["TNTXM", "annotation", "trendTNTXM"],
              title: { text: 'Température' },
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
            const trendDataRR = calculateTrendLine(average, "MOIS", "RR", "trendRR");
            const trendDataTNTXM = calculateTrendLine(average, "MOIS", "TNTXM", "trendTNTXM");

            // Calcul des z-scores pour identifier les anomalies
            const tempMaxZScores = calculateZScores(average, "TNTXM");
            const precipZScores = calculateZScores(average, "RR");

            // Identification des événements extrêmes
            const tempMaxExtremes = identifyExtremes(tempMaxZScores, "MOIS", "TNTXM", 2, "Température"); // seuil de 2 z-scores pour les événements extrêmes
            const precipExtremes = identifyExtremes(precipZScores, "MOIS", "RR", 2, "Précipitation");

            setOptions({
                ...options,
                data: average,
                series: [
                    {
                        type: "line",
                        xKey: "MOIS",
                        yKey: "TNTXM",
                        yName: "Température (°C et 1/10)",
                        tooltip: {
                            renderer: (params) => tooltipRenderer({ ...params, unite: '(°C et 1/10)' }),
                        },
                    },
                    {
                        type: "line",
                        xKey: "MOIS",
                        yKey: "RR",
                        yName: "Précipitation (mm et 1/10)",
                        tooltip: {
                          renderer: (params) => tooltipRenderer({ ...params, unite: '(mm et 1/10)' }),
                        },
                    },
                    {
                        type: "line",
                        xKey: "MOIS",
                        yKey: "trendRR",
                        yName: "Tendance Précipitations",
                        data: trendDataRR,
                        tooltip: {
                            renderer: (params) => tooltipRenderer({ ...params, unite: '(mm)' }),
                        },
                        stroke: "red",
                        lineDash: [5, 5],
                    },
                    {
                        type: "line",
                        xKey: "MOIS",
                        yKey: "trendTNTXM",
                        yName: "Tendance Température",
                        data: trendDataTNTXM,
                        tooltip: {
                            renderer: (params) => tooltipRenderer({ ...params, unite: '(°C et 1/10)' }),
                        },
                        stroke: "black",
                        lineDash: [5, 5],
                    },
                    {
                        type: "scatter",
                        xKey: "MOIS",
                        yKey: "annotation",
                        data: [...tempMaxExtremes, ...precipExtremes],
                        labelKey: "label",
                        yName: "Annotations",
                        marker: {
                            shape: 'diamond',
                            size: 20,
                            fill: 'brown',
                        },
                        tooltip: {
                            renderer: ({ datum }) => ({ content: datum.label }),
                        }
                    }
                ],
            })
        }
        return () => mounted = true
    }, [average])

    return <Chart isLoading={isLoading} options={options} />
}

export default AverageMonthChart
