<template>
  <div id="record-list">
    <report-list-component :flag="flag" :columns="columns" :columnsList="columnsList" :data="data" @columnsMehtod="changeColumns">
      <Form ref="formCustom" :model="searchData" label-position="left" :label-width="60" :label-colon="true" class="search-form">
        <FormItem label="配件名称" prop="name" :label-width="80">
          <Input type="text" v-model="searchData.name" placeholder="请输入配件名" />
        </FormItem>
        <FormItem label="型号" prop="model" :label-width="40">
          <Input type="text" v-model="searchData.model" placeholder="请输入配件型号" />
        </FormItem>
        <FormItem label="条形码" prop="barCode">
          <Input type="text" v-model="searchData.barCode" number placeholder="请输入配件条形码" />
        </FormItem>
        <FormItem label="适用车型" prop="apply" :label-width="80">
          <Input type="text" v-model="searchData.apply" placeholder="请输入配件适用车型" />
        </FormItem>
        <FormItem label="种类" prop="kind" :label-width="40">
          <Input type="text" v-model="searchData.kind" placeholder="请输入配件种类" />
        </FormItem>
        <!-- <FormItem label="开始时间" prop="start" :label-width="40">
          <DatePicker type="date" @on-change="startDate" placeholder="请输入具体时间" style="width: 300px" />
        </FormItem>
        <FormItem label="结束时间" prop="end" :label-width="40">
          <DatePicker type="date" @on-change="endDate" v-model="searchData.end" placeholder="请输入具体时间" style="width: 300px" />
        </FormItem> -->
        <FormItem>
          <Button type="primary" @click="handleSubmit('formCustom')">查询</Button>
        </FormItem>
      </Form>
      <Page slot="page" :page-size-opts="[10,20,40,80,120,200]" :current="Number(page.page)" :page-size="Number(page.pageSize)" :total="Number(page.total)" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize" />
    </report-list-component>
  </div>
</template>

<script>
import clonedeep from 'clonedeep'
import { searchPartsReport } from '@/api/parts'
import reportListComponent from '../components/table'
export default {
  name: 'partsReport',
  components: {
    reportListComponent
  },
  data () {
    return {
      flag: 'partsReport',
      page: {
        total: 0,
        page: 1,
        pageSize: 10
      },
      searchData: {
        name: '',
        model: '',
        barCode: '',
        apply: '',
        kind: '',
        start: '',
        end: ''
      },
      columns: [
        { title: '序号', type: 'index', width: 80, align: 'center' },
        {
          title: '型号',
          key: 'partModel',
          sortable: true,
          sortType: 'asc',
          width: 200,
          align: 'center',
          render: (h, params) => {
            return h('router-link', {
              props: {
                to: {
                  name: 'allRecord',
                  params: { model: params.row.partModel }
                }
              }
            },
            [
              h('span', params.row.partModel)
            ])
          }
        },
        {
          title: '名称',
          key: 'partName',
          sortable: true,
          width: 200,
          align: 'center',
          render: (h, params) => {
            return h('router-link', {
              props: {
                to: {
                  name: 'allRecord',
                  params: { name: params.row.partName }
                }
              }
            },
            [
              h('span', params.row.partName)
            ])
          }
        },
        { title: '条形码', key: 'barCode', sortable: true, width: 120, align: 'center' },
        { title: '适用车型', key: 'apply', sortable: true, width: 110, align: 'center' },
        { title: '种类', key: 'kind', sortable: true, width: 80, align: 'center' },
        { title: '品牌', key: 'brand', sortable: true, width: 100, align: 'center' },
        {
          title: '照片',
          key: 'photoUrl',
          width: 100,
          align: 'center',
          render (h, params) {
            if (params.row.photoUrl && params.row.photoUrl !== '') {
              return h('Avatar', {
                props: {
                  src: params.row.photoUrl,
                  shape: 'square',
                  size: 'large'
                }
              })
            } else {
              return h('span', '无添加照片')
            }
          }
        },
        { title: '出库数量', key: 'deliveryStock', sortable: true, width: 110, align: 'center' },
        { title: '入库数量', key: 'purchaseStock', sortable: true, width: 110, align: 'center' },
        { title: '盈亏情况', key: 'income', width: 110, align: 'center' },
        { title: '利润', key: 'profit', sortable: true, width: 100, align: 'center' },
        { title: '售出平均价格', key: 'avgPrice', sortable: true, width: 110, align: 'center' }
      ],
      columnsList: [
        { title: '序号', type: 'index', width: 80, align: 'center' },
        {
          title: '型号',
          key: 'partModel',
          sortable: true,
          sortType: 'asc',
          width: 200,
          align: 'center',
          render: (h, params) => {
            return h('router-link', {
              props: {
                to: {
                  name: 'allRecord',
                  params: { model: params.row.partModel }
                }
              }
            },
            [
              h('span', params.row.partModel)
            ])
          }
        },
        {
          title: '名称',
          key: 'partName',
          sortable: true,
          width: 200,
          align: 'center',
          render: (h, params) => {
            return h('router-link', {
              props: {
                to: {
                  name: 'allRecord',
                  params: { name: params.row.partName }
                }
              }
            },
            [
              h('span', params.row.partName)
            ])
          }
        },
        { title: '条形码', key: 'barCode', sortable: true, width: 120, align: 'center' },
        { title: '适用车型', key: 'apply', sortable: true, width: 110, align: 'center' },
        { title: '种类', key: 'kind', sortable: true, width: 80, align: 'center' },
        { title: '品牌', key: 'brand', sortable: true, width: 100, align: 'center' },
        {
          title: '照片',
          key: 'photoUrl',
          width: 100,
          align: 'center',
          render (h, params) {
            if (params.row.photoUrl && params.row.photoUrl !== '') {
              return h('Avatar', {
                props: {
                  src: params.row.photoUrl,
                  shape: 'square',
                  size: 'large'
                }
              })
            } else {
              return h('span', '无添加照片')
            }
          }
        },
        { title: '出库数量', key: 'deliveryStock', sortable: true, width: 110, align: 'center' },
        { title: '入库数量', key: 'purchaseStock', sortable: true, width: 110, align: 'center' },
        { title: '盈亏情况', key: 'income', width: 110, align: 'center' },
        { title: '利润', key: 'profit', sortable: true, width: 100, align: 'center' },
        { title: '售出平均价格', key: 'avgPrice', sortable: true, width: 110, align: 'center' }
      ],
      data: []
    }
  },
  mounted () {
    this.getTableList()
  },
  methods: {
    getTableList () {
      const data = clonedeep(this.searchData)
      const pages = clonedeep(this.page)
      searchPartsReport(data, pages).then(res => {
        if (res.code === 200) {
          this.page.pageSize = res.pages.pageSize
          this.page.total = res.pages.total
          this.page.page = res.pages.page
          this.data = res.data
        } else {
          this.$Message.error(res.msg ? res.msg : res.message)
        }
      })
    },
    changeColumns (data) {
      // console.log('data', data)
      this.columns = data
    },
    startDate (a, b) {
      this.searchData.start = a
      console.log(a, b)
    },
    endDate (a, b) {
      this.searchData.end = a
      console.log(a, b)
    },
    handleSubmit (name) {
      this.$Spin.show()
      this.$refs[name].validate((valid) => {
        if (valid) {
          const data = clonedeep(this.searchData)
          const pages = {
            total: 0,
            page: 1,
            pageSize: 10
          }
          searchPartsReport(data, pages).then(res => {
            console.log(res)
            if (res.code === 200) {
              this.data = res.data
              this.page.pageSize = res.pages.pageSize
              this.page.total = res.pages.total
              this.page.page = res.pages.page
            } else {
              this.data = []
              this.$Message.error(res.msg ? res.msg : res.message)
            }
          })
        } else {
          this.$Message.error('请输入合法字符！')
        }
      })
      this.$Spin.hide()
    },
    changePage (page) {
      const data = clonedeep(this.searchData)
      const pages = clonedeep(this.page)
      pages.page = page
      searchPartsReport(data, pages).then(res => {
        console.log(res)
        if (res.code === 200) {
          this.data = res.data
          this.page.pageSize = res.pages.pageSize
          this.page.total = res.pages.total
          this.page.page = res.pages.page
        } else {
          this.data = []
          this.$Message.error(res.msg ? res.msg : res.message)
        }
      })
    },
    changePageSize (pageSize) {
      const data = clonedeep(this.searchData)
      const pages = clonedeep(this.page)
      pages.pageSize = pageSize
      searchPartsReport(data, pages).then(res => {
        console.log(res)
        if (res.code === 200) {
          this.data = res.data
          this.page.pageSize = res.pages.pageSize
          this.page.total = res.pages.total
          this.page.page = res.pages.page
        } else {
          this.data = []
          this.$Message.error(res.msg ? res.msg : res.message)
        }
      })
    }
  }
}
</script>

<style lang="less">
  //
</style>
