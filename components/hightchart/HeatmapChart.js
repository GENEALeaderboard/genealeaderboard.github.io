"use client"

import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import HighchartsHeatmap from "highcharts/modules/heatmap"
import { useEffect, useState } from "react"

// if (typeof Highcharts === "object") {
//   HighchartsHeatmap(Highcharts)
// }

const HeatmapChart = ({ data }) => {
  const [options, setOptions] = useState({})

  useEffect(() => {
    const categoriesX = Array.from(new Set(data.map((item) => item.modelPair)))
    const categoriesY = Array.from(new Set(data.map((item) => item.input)))

    const seriesData = data.map((item) => [
      categoriesX.indexOf(item.modelPair),
      categoriesY.indexOf(item.input),
      item.score,
    ])

    setOptions({
      chart: {
        type: "heatmap",
      },
      title: {
        text: "AI Model Evaluation Heatmap",
      },
      xAxis: {
        categories: categoriesX,
        title: {
          text: "Model Pairs",
        },
      },
      yAxis: {
        categories: categoriesY,
        title: {
          text: "Inputs",
        },
        reversed: true,
      },
      colorAxis: {
        min: -1,
        max: 1,
        stops: [
          [0, "#FF0000"],
          [0.5, "#FFFFFF"],
          [1, "#0000FF"],
        ],
      },
      series: [
        {
          name: "Model Evaluation",
          borderWidth: 1,
          data: seriesData,
          dataLabels: {
            enabled: true,
            color: "#000000",
          },
        },
      ],
    })
  }, [data])

  return <HighchartsReact highcharts={Highcharts} options={options} />
}

export default HeatmapChart
