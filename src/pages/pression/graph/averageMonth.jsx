/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { calculateTrendLine, tooltipRenderer } from '../../../helpers';
import Chart from '../../../components/chart/chart';
import { mois } from '../../../constants';

const AverageMonthTmpPression = props => {
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
              keys: ["TNTXM", "trendTNTXM"],
              title: { text: 'Température' },
            },
            {
                // secondary y axis
                type: "number",
                position: "right",
                keys: ["PMERM", "trendPMERM"],
                title: {
                    text: "Pression Atmosphérique",
                },
            },
        ],
    });

    useEffect(() => {
        if (!mounted && average.length) {
            // Calcul de la ligne de tendance pour les précipitations
            const trendDataPMERM = calculateTrendLine(average, "MOIS", "PMERM", "trendPMERM");
            const trendDataTNTXM = calculateTrendLine(average, "MOIS", "TNTXM", "trendTNTXM");

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
                        yKey: "PMERM",
                        yName: "Pression Atmosphérique (en hPa et 1/10)",
                        tooltip: {
                          renderer: (params) => tooltipRenderer({ ...params, unite: '(en hPa et 1/10)' }),
                        },
                    },
                    {
                        type: "line",
                        xKey: "MOIS",
                        yKey: "trendPMERM",
                        yName: "Tendance Pression Atmosphériques",
                        data: trendDataPMERM,
                        tooltip: {
                            renderer: (params) => tooltipRenderer({ ...params, unite: '(en hPa et 1/10)' }),
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
                    }
                ],
            })
        }
        return () => mounted = true
    }, [average])

    return <Chart isLoading={isLoading} options={options} />
}

export default AverageMonthTmpPression
