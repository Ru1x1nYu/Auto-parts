<template>
  <div id="record-list">
    <report-list-component :flag="flag" :columns="columns" :columnsList="columnsList" :data="data" @columnsMehtod="changeColumns">
      <Form ref="formCustom" :model="searchData" label-position="left" :label-width="60" :label-colon="true" class="search-form">
        <FormItem label="开始时间" prop="start" :label-width="40">
          <DatePicker type="date" @on-change="startDate" placeholder="请输入具体时间" style="width: 300px" />
        </FormItem>
        <FormItem label="结束时间" prop="end" :label-width="40">
          <DatePicker type="date" @on-change="endDate" v-model="searchData.end" placeholder="请输入具体时间" style="width: 300px" />
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSubmit('formCustom')">查询</Button>
        </FormItem>
      </Form>
    </report-list-component>
  </div>
</template>

<script>
import clonedeep from 'clonedeep'
import { searchDateReport } from '@/api/parts'
import reportListComponent from '../components/table'
export default {
  name: 'partsReport',
  components: {
    reportListComponent
  },
  data () {
    return {
      flag: 'dateReport',
      searchData: {
        start: '',
        end: ''
      },
      columns: [
        { title: '序号', type: 'index', width: 60, align: 'center' },
        {
          title: '时间 ',
          key: '_id',
          sortable: true,
          sortType: 'asc',
          align: 'center'
        },
        {
          title: '当日售出数量',
          key: 'deliveryStock',
          sortable: true,
          align: 'center'
        },
        { title: '当日售出总价', key: 'deliveryPrice', sortable: true, align: 'center' },
        { title: '当日入库数量', key: 'purchaseStock', sortable: true, align: 'center' },
        { title: '当日入库总价', key: 'purchasePrice', sortable: true, align: 'center' },
        { title: '盈亏', key: 'income', align: 'center' },
        { title: '利润', key: 'profit', sortable: true, align: 'center' }
      ],
      columnsList: [
        { title: '序号', type: 'index', align: 'center' },
        {
          title: '时间 ',
          key: '_id',
          sortable: true,
          sortType: 'asc',
          align: 'center'
        },
        {
          title: '当日售出数量',
          key: 'deliveryStock',
          sortable: true,
          align: 'center'
        },
        { title: '当日售出总价', key: 'deliveryPrice', sortable: true, align: 'center' },
        { title: '当日入库数量', key: 'purchaseStock', sortable: true, align: 'center' },
        { title: '当日入库总价', key: 'purchasePrice', sortable: true, align: 'center' },
        { title: '盈亏', key: 'income', align: 'center' },
        { title: '利润', key: 'profit', sortable: true, align: 'center' }
      ],
      data: []
    }
  },
  mounted () {
    this.getTableList()
  },
  methods: {
    getTableList () {
      searchDateReport().then(res => {
        if (res.code === 200) {
          console.log(res.data)
          this.data = res.data
        } else {
          this.$Message.error(res.msg)
        }
      })
    },
    changeColumns (data) {
      this.columns = data
    },
    startDate (a, b) {
      this.searchData.start = a
    },
    endDate (a, b) {
      this.searchData.end = a
    },
    handleSubmit (name) {
      this.$Spin.show()
      this.$refs[name].validate((valid) => {
        if (valid) {
          const data = clonedeep(this.searchData)
          searchDateReport(data, pages).then(res => {
            if (res.code === 200) {
              this.data = res.data
            } else {
              this.data = clonedeep(res.data)
              this.$Message.error(res.msg)
            }
          })
        } else {
          this.$Message.error('请输入合法字符！')
        }
      })
      this.$Spin.hide()
    }
  }

}
</script>

<style lang="less">
  //
</style>
