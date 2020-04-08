<template>
  <div v-if="flag" ref="dom" class="charts chart-pie"></div>
</template>

<script>
import echarts from 'echarts'
import tdTheme from './theme.json'
import { on, off } from '@/libs/tools'
echarts.registerTheme('tdTheme', tdTheme)
export default {
  name: 'ChartPie',
  props: {
    flag: Boolean,
    value: Array,
    text: String,
    pieSelect: Object,
    subtext: String
  },
  data () {
    return {
      dom: null
    }
  },
  watch: {
    flag (val) {
      if (val === true) {
        this.init()
      }
    },
    value: {
      deep: true,
      handler (nv) {
        this.value = nv
        this.resize()
      }
    }
  },
  updated () {
    this.init()
  },
  methods: {
    resize () {
      this.dom.resize()
    },
    init () {
      this.$nextTick(() => {
        console.log(this.pieSelect)
        let option = {
          title: {
            text: this.text,
            subtext: this.subtext,
            x: 'center'
          },
          tooltip: {
            trigger: 'item',
            position: 'right',
            formatter: '{b} : {c}次 ({d}%)'
          },
          legend: {
            type: 'scroll',
            orient: 'vertical',
            right: 10,
            top: '10%',
            bottom: 20,
            data: this.value.map(_ => _.name),

            selected: this.pieSelect
          },
          series: [
            {
              type: 'pie',
              radius: '55%',
              center: ['50%', '60%'],
              data: this.value,
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        }
        console.log(option)
        this.dom = echarts.init(this.$refs.dom, 'tdTheme')
        this.dom.setOption(option)
        on(window, 'resize', this.resize)
      })
    }
  },
  beforeDestroy () {
    off(window, 'resize', this.resize)
  }
}
</script>
