<template>
  <div v-if="flag" ref="dom" class="charts chart-line"></div>
</template>

<script>
import echarts from 'echarts'
import tdTheme from './theme.json'
import { on, off } from '@/libs/tools'
echarts.registerTheme('tdTheme', tdTheme)
export default {
  name: 'ChartLine',
  props: {
    flag: Boolean,
    xAxisData: Array,
    seriesData: Array,
    text: String,
    legend: Object,
    subtext: String
  },
  data () {
    return {
      option: {
        title: {
          text: this.text,
          subtext: this.subtext,
          x: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        toolbox: {
          feature: {
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ['line', 'bar'] },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        legend: this.legend,
        xAxis: {
          type: 'category',
          axisPointer: {
            type: 'shadow'
          },
          data: this.xAxisData
        },
        yAxis: {
          type: 'value'
        },
        series: this.seriesData
      },
      dom: null
    }
  },
  methods: {
    resize () {
      this.dom.resize()
    }
  },
  watch: {
    xAxisData (val) {
      this.option.xAxis.data = val
    },
    seriesData (val) {
      this.option.series = val
    },
    flag (val) {
      console.log(val)
      if (val === true) {
        console.log(this.option)
        this.$nextTick(() => {
          this.dom = echarts.init(this.$refs.dom, 'tdTheme')
          this.dom.setOption(this.option)
          on(window, 'resize', this.resize)
        })
      }
    }
  },
  mounted () {

  },
  beforeDestroy () {
    off(window, 'resize', this.resize)
  }
}
</script>
