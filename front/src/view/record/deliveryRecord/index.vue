<template>
  <div id="record-list">
    <list-component :flag="flag" :columns="columns" :columnsList="columnsList" :data="data" @columnsMehtod="changeColumns">
      <Form ref="formCustom" :model="searchData" label-position="left" :rules="ruleCustom" :label-width="60" :label-colon="true" class="search-form">
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
      <Page slot="page" :page-size-opts="[10,20,40,80,120,200]" :current="Number(page.page)" :page-size="Number(page.pageSize)" :total="Number(page.total)" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize" />
    </list-component>
  </div>
</template>

<script>
import clonedeep from 'clonedeep'
import { searchPAndD } from '@/api/delivery'
import listComponent from '../component/list'
export default {
  name: 'deliveryRecord',
  components: {
    listComponent
  },
  data () {
    return {
      flag: 'delivery',
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
      ruleCustom: {
        name: [
          { type: 'string', trigger: 'blur' }
        ],
        model: [
          { type: 'string', trigger: 'blur' }
        ],
        barCode: [
          { type: 'number', trigger: 'blur' }
        ],
        apply: [
          { type: 'string', trigger: 'blur' }
        ],
        kind: [
          { type: 'string', trigger: 'blur' }
        ]
      },
      columns: [
        { title: '序号', type: 'index', sortable: true, width: 80, align: 'center' },
        {
          title: '型号',
          key: 'model',
          sortable: true,
          width: 200,
          align: 'center',
          render: (h, params) => {
            return h('router-link', {
              props: {
                to: {
                  name: 'editParts',
                  params: { id: params.row.partId }
                }
              }
            },
            [
              h('span', params.row.model)
            ])
          }
        },
        {
          title: '配件名称',
          key: 'name',
          sortable: true,
          width: 200,
          align: 'center',
          render: (h, params) => {
            return h('router-link', {
              props: {
                to: {
                  name: 'editParts',
                  params: { id: params.row.partId }
                }
              }
            },
            [
              h('span', params.row.name)
            ])
          }
        },
        { title: '二维码', key: 'barCode', sortable: true, width: 120, align: 'center' },
        { title: '适用车型', key: 'apply', sortable: true, width: 110, align: 'center' },
        { title: '种类', key: 'kind', sortable: true, width: 80, align: 'center' },
        { title: '品牌', key: 'brand', sortable: true, width: 100, align: 'center' },
        {
          title: '照片',
          searchable: false,
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
        { title: '预售价格', key: 'price', sortable: true, width: 110, align: 'center' },
        { title: '售出数量', key: 'deliveryStock', sortable: true, width: 110, align: 'center' },
        { title: '当前库存', key: 'atTimeStock', sortable: true, width: 110, align: 'center' },
        { title: '现有库存', key: 'stock', fixed: 'right', sortable: true, width: 110, align: 'center' },
        { title: '售出价格', key: 'deliveryPrice', sortable: true, width: 110, align: 'center' },
        { title: '售出总价', key: 'deliveryTotal', sortable: true, width: 110, align: 'center' },
        { title: '操作者', key: 'userName', sortable: true, width: 100, align: 'center' },
        {
          title: '时间',
          key: 'createdAt',
          sortType: 'asc',
          sortable: true,
          sortMethod: (a, b, type) => {
            if (type === 'desc') {
              return new Date(a) < new Date(b) ? 1 : -1
            } else {
              return new Date(a) > new Date(b) ? 1 : -1
            }
          },
          render: (h, params) => {
            console.log(params.row.createdAt)
            return h('span', params.row.createdAt)
          },
          width: 120,
          align: 'center'
        }
      ],
      columnsList: [
        { title: '序号', type: 'index', sortable: true, width: 80, align: 'center' },
        {
          title: '型号',
          key: 'model',
          sortable: true,
          width: 200,
          align: 'center',
          render: (h, params) => {
            return h('router-link', {
              props: {
                to: {
                  name: 'editParts',
                  params: { id: params.row.partId }
                }
              }
            },
            [
              h('span', params.row.model)
            ])
          }
        },
        {
          title: '配件名称',
          key: 'name',
          sortable: true,
          width: 200,
          align: 'center',
          render: (h, params) => {
            return h('router-link', {
              props: {
                to: {
                  name: 'editParts',
                  params: { id: params.row.partId }
                }
              }
            },
            [
              h('span', params.row.name)
            ])
          }
        },
        { title: '二维码', key: 'barCode', sortable: true, width: 120, align: 'center' },
        { title: '适用车型', key: 'apply', sortable: true, width: 110, align: 'center' },
        { title: '种类', key: 'kind', sortable: true, width: 80, align: 'center' },
        { title: '品牌', key: 'brand', sortable: true, width: 100, align: 'center' },
        {
          title: '照片',
          searchable: false,
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
        { title: '预售价格', key: 'price', sortable: true, width: 110, align: 'center' },
        { title: '售出数量', key: 'deliveryStock', sortable: true, width: 110, align: 'center' },
        { title: '当前库存', key: 'atTimeStock', sortable: true, width: 110, align: 'center' },
        { title: '现有库存', key: 'stock', fixed: 'right', sortable: true, width: 110, align: 'center' },
        { title: '售出价格', key: 'deliveryPrice', sortable: true, width: 110, align: 'center' },
        { title: '售出总价', key: 'deliveryTotal', sortable: true, width: 110, align: 'center' },
        { title: '操作者', key: 'userName', sortable: true, width: 100, align: 'center' },
        {
          title: '时间',
          key: 'createdAt',
          sortType: 'asc',
          sortable: true,
          sortMethod: (a, b, type) => {
            if (type === 'desc') {
              return new Date(a) < new Date(b) ? 1 : -1
            } else {
              return new Date(a) > new Date(b) ? 1 : -1
            }
          },
          render: (h, params) => {
            return h('span', params.row.createdAt)
          },
          width: 120,
          align: 'center'
        }
      ],
      data: []
    }
  },
  mounted () {
    this.getListInfo()
  },
  methods: {
    getListInfo () {
      const data = clonedeep(this.searchData)
      const pages = clonedeep(this.page)
      searchPAndD(data, pages).then(res => {
        if (res.code === 200) {
          let data = clonedeep(res.data)
          this.page.pageSize = res.pages.pageSize
          this.page.total = res.pages.total
          this.page.page = res.pages.page
          this.data = data.map(item => {
            // console.log(item)
            let part = clonedeep(item.partsId)
            let operator = clonedeep(item.operator)
            item['partId'] = part._id
            item['deliveryPrice'] = Number(item['deliveryPrice'])
            item['deliveryStock'] = Number(item['deliveryStock'])
            item['stock'] = Number(item['stock'])
            item['price'] = Number(item['price'])
            item['deliveryTotal'] = Number(item['deliveryPrice']) * Number(item['deliveryStock'])
            item['atTimeStock'] = Number(item['atTimeStock'])
            item['operatorId'] = operator._id
            delete item.partsId
            delete item.operator
            item.createdAt = new Date(item.createdAt).toLocaleString()
            return Object.assign(item, part, operator)
          })
          // console.log(this.data)
        }
      })
    },
    startDate (a, b) {
      this.searchData.start = a
      // console.log(a, b)
    },
    endDate (a, b) {
      this.searchData.end = a
      // console.log(a, b)
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          const data = clonedeep(this.searchData)
          const pages = {
            total: 0,
            page: 1,
            pageSize: 10
          }
          searchPAndD(data, pages).then(res => {
            if (res.code === 200) {
              let data = clonedeep(res.data)
              this.page.pageSize = res.pages.pageSize
              this.page.total = res.pages.total
              this.page.page = res.pages.page
              this.data = data.map(item => {
                let part = clonedeep(item.partsId)
                let operator = clonedeep(item.operator)
                item['partId'] = part._id
                item['deliveryPrice'] = Number(item['deliveryPrice'])
                item['deliveryStock'] = Number(item['deliveryStock'])
                item['stock'] = Number(item['stock'])
                item['price'] = Number(item['price'])
                item['deliveryTotal'] = Number(item['deliveryPrice']) * Number(item['deliveryStock'])
                item['atTimeStock'] = Number(item['atTimeStock'])
                item['operatorId'] = operator._id
                delete item.partsId
                delete item.operator
                item.createdAt = new Date(item.createdAt)
                return Object.assign(item, part, operator)
              })
            } else {
              this.data = clonedeep(res.data)
              this.$Message.error(res.msg)
            }
          })
        } else {
          this.$Message.error('Fail!')
        }
      })
    },
    changeColumns (data) {
      this.columns = data
    },
    changePage (page) {
      const data = clonedeep(this.searchData)
      const pages = clonedeep(this.page)
      pages.page = page
      searchPAndD(data, pages).then(res => {
        if (res.code === 200) {
          let data = clonedeep(res.data)
          this.page.pageSize = res.pages.pageSize
          this.page.total = res.pages.total
          this.page.page = res.pages.page
          this.data = data.map(item => {
            let part = clonedeep(item.partsId)
            let operator = clonedeep(item.operator)
            item['partId'] = part._id
            item['deliveryPrice'] = Number(item['deliveryPrice'])
            item['deliveryStock'] = Number(item['deliveryStock'])
            item['stock'] = Number(item['stock'])
            item['price'] = Number(item['price'])
            item['deliveryTotal'] = Number(item['deliveryPrice']) * Number(item['deliveryStock'])
            item['atTimeStock'] = Number(item['atTimeStock'])
            item['operatorId'] = operator._id
            delete item.partsId
            delete item.operator
            item.createdAt = new Date(item.createdAt)
            return Object.assign(item, part, operator)
          })
        } else {
          this.data = clonedeep(res.data)
          this.$Message.error(res.msg)
        }
      })
    },
    changePageSize (pageSize) {
      const data = clonedeep(this.searchData)
      const pages = clonedeep(this.page)
      pages.pageSize = pageSize
      searchPAndD(data, pages).then(res => {
        if (res.code === 200) {
          let data = clonedeep(res.data)
          this.page.pageSize = res.pages.pageSize
          this.page.total = res.pages.total
          this.page.page = res.pages.page
          this.data = data.map(item => {
            let part = clonedeep(item.partsId)
            let operator = clonedeep(item.operator)
            item['partId'] = part._id
            item['deliveryPrice'] = Number(item['deliveryPrice'])
            item['deliveryStock'] = Number(item['deliveryStock'])
            item['stock'] = Number(item['stock'])
            item['price'] = Number(item['price'])
            item['deliveryTotal'] = Number(item['deliveryPrice']) * Number(item['deliveryStock'])
            item['atTimeStock'] = Number(item['atTimeStock'])
            item['operatorId'] = operator._id
            delete item.partsId
            delete item.operator
            item.createdAt = new Date(item.createdAt)
            return Object.assign(item, part, operator)
          })
        } else {
          this.data = clonedeep(res.data)
          this.$Message.error(res.msg)
        }
      })
    }
  }
}
</script>

<style lang="less">
  //
</style>
