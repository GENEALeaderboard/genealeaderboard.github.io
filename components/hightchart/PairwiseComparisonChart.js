"use client"

import React from "react"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import heatmap from "highcharts/modules/heatmap"

// if (typeof Highcharts === "object") {
//   heatmap(Highcharts)
// }

const PairwiseComparisonChart = ({ data }) => {
  const options = {
    chart: {
      type: "heatmap",
      height: 600,
    },
    title: {
      text: "Pairwise Comparison of AI Models for Video Generation",
    },
    xAxis: {
      categories: [
        "Model 1",
        "Model 2",
        "Model 3",
        "Model 4",
        "Model 5",
        "Model 6",
        "Model 7",
        "Model 8",
      ],
      title: null,
    },
    yAxis: {
      categories: [
        "Model 1",
        "Model 2",
        "Model 3",
        "Model 4",
        "Model 5",
        "Model 6",
        "Model 7",
        "Model 8",
      ],
      title: null,
    },
    colorAxis: {
      min: -1,
      max: 1,
      stops: [
        [0, "#ff0000"],
        [0.5, "#ffffff"],
        [1, "#00ff00"],
      ],
    },
    legend: {
      align: "right",
      layout: "vertical",
      margin: 0,
      verticalAlign: "top",
      y: 25,
      symbolHeight: 280,
    },
    tooltip: {
      formatter: function () {
        return `<b>${this.series.xAxis.categories[this.point.x]} vs ${this.series.yAxis.categories[this.point.y]}</b><br/>
                Preference: ${this.point.value > 0 ? "Right Model" : this.point.value < 0 ? "Left Model" : "Equal"}`
      },
    },
    series: [
      {
        name: "Pairwise Comparison",
        borderWidth: 1,
        data: data,
        dataLabels: {
          enabled: true,
          color: "#000000",
        },
      },
    ],
  }

  return <HighchartsReact highcharts={Highcharts} options={options} />
}

export default PairwiseComparisonChart
