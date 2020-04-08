<template>
  <div>
    <Row :gutter="20">
      <i-col :xs="12" :md="8" :lg="6" v-for="(infor, i) in inforCardData" :key="`infor-${i}`" style="height: 120px;padding: 0 10px 14px 10px">
        <infor-card shadow :color="infor.color" :icon="infor.icon" :left="30" :icon-size="60">
          <count-to :end="infor.count" count-class="count-style"/>
          <p style="font-size: 15px; font-weight: bold;">{{ infor.title }}</p>
        </infor-card>
      </i-col>
    </Row>
    <Row :gutter="20" style="margin-top: 10px;">
      <i-col :md="24" :lg="9" style="margin-bottom: 20px;">
        <Card shadow>
          <chart-pie style="height: 400px;" :flag="flag" :pieSelect="pieSelect" :value="pieData" text="员工工作操作的积极性"></chart-pie>
        </Card>
      </i-col>
      <i-col :md="24" :lg="15" style="margin-bottom: 10px;">
        <Card shadow>
          <chart-bar-line style="height: 400px;" :flag="flag" :xAxisData="lXAxisData" :seriesData="lSeriesData" :legend="lLegend" text="全部收入与支出情况"/>
        </Card>
      </i-col>
    </Row>
    <Row :gutter="20" style="margin-top: 10px;">
      <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
        <Card shadow>
          <chart-bar-line style="height: 500px;" :flag="flag" :xAxisData="pXAxisData" :seriesData="pSeriesData" :legend="pLegend" text="配件入库情况"/>
        </Card>
      </i-col>
      <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
        <Card shadow>
          <chart-bar-line style="height: 500px;" :flag="flag" :xAxisData="dXAxisData" :seriesData="dSeriesData" :legend="dLegend" text="配件销量情况"/>
        </Card>
      </i-col>
    </Row>
  </div>
</template>

<script>
import InforCard from '@/components/info-card'
import CountTo from '@/components/count-to'
import { getNotice } from '@/api/parts'
import { ChartPie, ChartBar, ChartBarLine, ChartLine } from '@/components/charts'
import { getHomeCount, getHomeChart, getHomePie, getProfitData } from '@/api/home'
export default {
  name: 'home',
  components: {
    InforCard,
    CountTo,
    ChartBarLine,
    ChartLine,
    ChartPie,
    ChartBar
  },
  data () {
    return {
      flag: false,
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
      inforCardData: [
        { title: '昨日销量', icon: 'ios-paper', count: 0, color: '#2d8cf0' },
        { title: '昨日收入', icon: 'ios-trending-up', count: 0, color: '#19be6b' },
        { title: '昨日支出', icon: 'ios-stats', count: 0, color: '#ff9900' },
        { title: '昨日净赚', icon: 'ios-swap', count: 0, color: '#019fa0' },
        { title: '上月销量', icon: 'ios-paper-outline', count: 0, color: '#ed3f14' },
        { title: '上月收入', icon: 'md-trending-up', count: 0, color: '#E46CBB' },
        { title: '上月支出', icon: 'md-stats', count: 0, color: '#9A66E4' },
        { title: '上月净赚', icon: 'md-swap', count: 0, color: '#F47378' }
      ],
      pieData: [],
      pieSelect: {},
      lineData: []
    }
  },
  mounted () {
    this.getHomeData()
    getNotice().then(res => {
      if (res.code && res.code === 200 && res.data && res.data.length !== 0) {
        for (let i in res.data) {
          this.$Notice.warning({
            title: res.data.msg,
            desc: `${res.data[i].name}的库存为${res.data[i].stock}件，低于警报线${res.data[i].alertNumber}件，请马上前往进货！`,
            render: (h) => {
              return h('p', {
                style: {
                  lineHeight: '20px',
                  margin: '8px 0',
                  fontSize: '13px',
                  padding: '0 10px'
                }
              }, [
                h('span', {
                  style: {
                    color: 'blue',
                    fontWeight: 'bold'
                  }
                }, res.data[i].name),
                '的库存为',
                h('span', {
                  style: {
                    color: 'red',
                    fontWeight: 'bold'
                  }
                }, `${res.data[i].stock}`),
                '件，低于警戒线',
                h('span', {
                  style: {
                    color: 'red',
                    fontWeight: 'bold'
                  }
                }, `${res.data[i].alertNumber}`),
                '件，请马上前往配件列表',
                '进货！'
              ])
            },
            duration: 0
          })
        }
      }
    })
  },
  methods: {
    async getHomeData () {
      Promise.all([getHomeCount(), getHomeChart(), getHomePie(), getProfitData()]).then(res => {
        // countTo
        {
          const data1 = res[0].data
          this.inforCardData[0]['count'] = data1.dayDeliveryCount
          this.inforCardData[1]['count'] = data1.dayIncome
          this.inforCardData[2]['count'] = data1.dayExpend
          this.inforCardData[3]['count'] = data1.dayIncome - data1.dayExpend
          this.inforCardData[4]['count'] = data1.monthDeliveryCount
          this.inforCardData[5]['count'] = data1.monthIncome
          this.inforCardData[6]['count'] = data1.monthExpend
          this.inforCardData[7]['count'] = data1.monthIncome - data1.monthExpend
        }
        // 柱形图/折线图
        {
          const data2 = res[1].data
          this.dXAxisData = data2.deliveryDate
          this.dSeriesData = [
            {
              name: '售出价格',
              type: 'bar',
              data: data2.deliveryPrice
            },
            {
              name: '售出数量',
              type: 'line',
              data: data2.deliveryStock
            }
          ]
          this.pXAxisData = data2.purchaseDate
          this.pSeriesData = [
            {
              name: '入库价格',
              type: 'bar',
              data: data2.purchasePrice
            },
            {
              name: '入库数量',
              type: 'line',
              data: data2.purchaseStock
            }
          ]
        }
        // 饼图
        {
          const data3 = res[2].data
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
        }
        // 多折线图
        const data4 = res[3].data
        this.lXAxisData = data4.date
        this.lSeriesData = [
          {
            name: '售出总额',
            type: 'line',
            data: data4.delivery
          },
          {
            name: '入库总额',
            type: 'line',
            data: data4.purchase
          },
          {
            name: '净赚利润',
            type: 'line',
            data: data4.profit
          }
        ]
      }).finally(() => {
        this.flag = true
      })
    }
  }
}
</script>

<style lang="less">
.count-style{
  font-size: 42px;
}
</style>
