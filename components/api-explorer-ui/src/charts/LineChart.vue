<template>
  <div>
    <canvas ref="chartCanvas" style="height: 200px; width: 100%;"></canvas>
  </div>
</template>

<script>
import { shallowRef } from 'vue'

import Chart from 'chart.js/auto'

function defaultLineChartData() {
  return {
    labels: ['January', 'February', 'March', /* ... */],
    datasets: [
      {
        label: 'Hannah',
        data: [10, 8, 5, /* ... */],
        borderColor: 'blue',
        fill: false
      },
      {
        label: 'John',
        data: [5, 7, 9, /* ... */],
        borderColor: 'red',
        fill: false
      }
    ]
  }
}

export default {
  props: {
    chartData: {
      type: Object,
      default() {
        return defaultLineChartData()
      }
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.createChart()
  },
  methods: {
    createChart() {
      // Get the canvas element reference
      const ctx = this.$refs.chartCanvas.getContext('2d');

      if (this.chart) {
        this.chart.destroy()
      }

      // Create the chart
      const chart = new Chart(ctx, {
        type: 'line',
        data: this.chartData ?? defaultLineChartData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          elements: {
            line: {
              cubicInterpolationMode: 'monotone'
            }
          }
        }
      })
      this.chart = shallowRef(chart)
    }
  },
  watch: {
    chartData() {
      this.createChart()
    }
  }
}
</script>