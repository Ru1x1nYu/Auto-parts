<template>
  <div id="chart-content">
    <h2>{{ name }}的数据可视化</h2>
    <Row :gutter="20" style="margin-top: 10px;">
      <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
        <Card shadow>
          <chart-bar-line style="height: 400px;" :flag="flag" :xAxisData="pXAxisData" :seriesData="pSeriesData" :legend="pLegend" text="配件入库情况"/>
        </Card>
      </i-col>
      <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
        <Card shadow>
          <chart-bar-line style="height: 400px;" :flag="flag" :xAxisData="dXAxisData" :seriesData="dSeriesData" :legend="dLegend" text="配件销量情况"/>
        </Card>
      </i-col>
    </Row>
    <Row :gutter="20" style="margin-top: 10px;">
      <i-col :md="24" :lg="9" style="margin-bottom: 20px;">
        <Card shadow>
          <chart-pie style="height: 400px;" :flag="flag" :pieSelect="pieSelect" :value="pieData" text="操作该配件的员工次数"></chart-pie>
        </Card>
      </i-col>
      <i-col :md="24" :lg="15" style="margin-bottom: 10px;">
        <Card shadow>
          <chart-line style="height: 400px;" :flag="flag" :xAxisData="lXAxisData" :seriesData="lSeriesData" :legend="lLegend" :text="`${name}收入与支出情况`"/>
        </Card>
      </i-col>
    </Row>
  </div>
</template>

<script>
import { ChartPie, ChartBar, ChartBarLine, ChartLine } from '@/components/charts'

import { getPartChart } from '@/api/parts'
export default {
  name: 'partChart',
  components: {
    ChartBarLine,
    ChartLine,
    ChartPie,
    ChartBar
  },
  data () {
    return {
      flag: false,
      name: '',
      pieSelect: {},
      pieData: [],
      dLegend: {
        top: '5%',
        data: ['售出价格', '售出数量']
      },
      dXAxisData: [],
      dSeriesData: [],
      pLegend: {
        top: '5%',
        data: ['入库价格', '入库数量']
      },
      pXAxisData: [],
      pSeriesData: [],
      lLegend: {
        top: '5%',
        data: ['售出总额', '入库总额', '净赚利润']
      },
      lXAxisData: [],
      lSeriesData: [],
      id: this.$route.params.id
    }
  },
  mounted () {
    this.getData()
    console.log(this.name)
  },
  methods: {
    getData () {
      Promise.all([getPartChart(this.id.toString())]).then(res => {
        const data0 = res[0].data
        this.name = data0.name
        this.dXAxisData = data0.deliveryDate
        this.dSeriesData = [
          {
            name: '售出价格',
            type: 'bar',
            data: data0.deliveryPrice
          },
          {
            name: '售出数量',
            type: 'line',
            data: data0.deliveryStock
          }
        ]
        this.pXAxisData = data0.purchaseDate
        this.pSeriesData = [
          {
            name: '入库价格',
            type: 'bar',
            data: data0.purchasePrice
          },
          {
            name: '入库数量',
            type: 'line',
            data: data0.purchaseStock
          }
        ]
        this.lXAxisData = data0.date
        this.lSeriesData = [
          {
            name: '售出总额',
            type: 'line',
            data: data0.delivery
          },
          {
            name: '入库总额',
            type: 'line',
            data: data0.purchase
          },
          {
            name: '净赚利润',
            type: 'line',
            data: data0.profit
          }
        ]
        const data3 = data0.datas
        data3.forEach((item, index) => {
          this.pieData[index] = {
            value: '',
            name: ''
          }
          this.pieSelect[item.operator] = true
          console.log(this.pieSelect)
          this.pieData[index]['value'] = item.count
          this.pieData[index]['name'] = item.operator
        })
      }).finally(() => {
        this.flag = true
      })
    }
  }
}
</script>

<style lang="less">
  #chart-content {
    //
  }
</style>
