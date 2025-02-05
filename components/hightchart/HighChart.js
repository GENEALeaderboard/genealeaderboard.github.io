"use client"

import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import { useEffect, useState } from "react"

const HighChart = ({ data }) => {
  const [options, setOptions] = useState({})

  useEffect(() => {
    const categories = data.map((item) => item.models)
    const seriesData = data.map((item) => ({
      name: `${item.models[0]} vs ${item.models[1]}`,
      data: item.scores,
    }))

    setOptions({
      chart: {
        type: "column",
      },
      title: {
        text: "AI Model Evaluation Comparison",
      },
      xAxis: {
        categories: categories,
        title: {
          text: "Model Pairs",
        },
      },
      yAxis: {
        min: -1,
        max: 1,
        title: {
          text: "Score",
        },
        plotLines: [
          {
            value: 0,
            color: "black",
            width: 1,
            zIndex: 2,
          },
        ],
      },
      series: seriesData,
    })
  }, [data])

  return <HighchartsReact highcharts={Highcharts} options={options} />
}

export default HighChart
