<template>
  <div id="record-list">
    <Card title="导出EXCEL">
      <Row>
        <Button icon="md-download" :loading="exportLoading" @click="exportExcel">导出文件</Button>
      </Row>
    </Card>
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
import excel from '@/libs/excel'
import { searchPAndD } from '@/api/parts'
import listComponent from '../component/list'
export default {
  name: 'deliveryRecord',
  components: {
    listComponent
  },
  data () {
    return {
      flag: 'allRecord',
      exportLoading: false,
      page: {
        total: 0,
        page: 1,
        pageSize: 10
      },
      searchData: {
        name: this.$route.params.name ? this.$route.params.name : '',
        model: this.$route.params.model ? this.$route.params.model : '',
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
        { title: '序号', type: 'index', width: 80, align: 'center' },
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
          title: '名称',
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
        { title: '预售价格', key: 'price', width: 110, align: 'center' },
        {
          title: '入库数量',
          key: 'purchaseStock',
          width: 110,
          align: 'center',
          render: (h, params) => {
            if (params.row.purchaseStock) {
              return h('span', params.row.purchaseStock)
            } else {
              return h('span', '----')
            }
          }
        },
        {
          title: '入库价格',
          key: 'purchasePrice',
          width: 110,
          align: 'center',
          render: (h, params) => {
            if (params.row.purchasePrice) {
              return h('span', params.row.purchasePrice)
            } else {
              return h('span', '----')
            }
          }
        },
        {
          title: '出库数量',
          key: 'deliveryStock',
          width: 110,
          align: 'center',
          render: (h, params) => {
            if (params.row.deliveryStock) {
              return h('span', params.row.deliveryStock)
            } else {
              return h('span', '----')
            }
          }
        },
        {
          title: '出库价格',
          key: 'deliveryPrice',
          width: 110,
          align: 'center',
          render: (h, params) => {
            if (params.row.deliveryPrice) {
              return h('span', params.row.deliveryPrice)
            } else {
              return h('span', '----')
            }
          }
        },
        {
          title: '净赚',
          key: 'total',
          width: 110,
          align: 'center'
        },
        {
          title: '当时库存',
          key: 'atTimeStock',
          width: 110,
          align: 'center',
          render: (h, params) => {
            if (params.row.atTimeStock) {
              return h('span', params.row.atTimeStock)
            } else {
              return h('span', '----')
            }
          }
        },
        {
          title: '现在库存',
          key: 'stock',
          sortable: true,
          width: 110,
          align: 'center',
          fixed: 'right',
          render: (h, params) => {
            if (params.row.stock) {
              return h('span', params.row.stock)
            } else {
              return h('span', '----')
            }
          }
        },
        { title: '动作',
          key: 'action',
          fixed: 'right',
          sortable: true,
          width: 100,
          align: 'center'
        },
        { title: '操作',
          key: 'handle',
          fixed: 'right',
          sortable: true,
          width: 120,
          align: 'center',
          render: (h, params) => {
            return h('router-link', {
              props: {
                to: {
                  path: `partChart/${params.row.partId}`
                }
              }
            },
            [
              h('Button', '数据可视化')
            ])
          }
        },
        { title: '操作者', key: 'userName', sortable: true, width: 100, align: 'center' },
        {
          title: '时间',
          key: 'createdAt',
          sortType: 'asc',
          sortable: true,
          render: (h, params) => {
            return h('span', new Date(params.row.createdAt).toLocaleString())
          },
          width: 120,
          align: 'center'
        }
      ],
      columnsList: [
        { title: '序号', type: 'index', width: 80, align: 'center' },
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
          title: '名称',
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
        { title: '预售价格', key: 'price', width: 110, align: 'center' },
        {
          title: '入库数量',
          key: 'purchaseStock',
          width: 110,
          align: 'center',
          render: (h, params) => {
            if (params.row.purchaseStock) {
              return h('span', params.row.purchaseStock)
            } else {
              return h('span', '----')
            }
          }
        },
        {
          title: '入库价格',
          key: 'purchasePrice',
          width: 110,
          align: 'center',
          render: (h, params) => {
            if (params.row.purchasePrice) {
              return h('span', params.row.purchasePrice)
            } else {
              return h('span', '----')
            }
          }
        },
        {
          title: '出库数量',
          key: 'deliveryStock',
          width: 110,
          align: 'center',
          render: (h, params) => {
            if (params.row.deliveryStock) {
              return h('span', params.row.deliveryStock)
            } else {
              return h('span', '----')
            }
          }
        },
        {
          title: '出库价格',
          key: 'deliveryPrice',
          width: 110,
          align: 'center',
          render: (h, params) => {
            if (params.row.deliveryPrice) {
              return h('span', params.row.deliveryPrice)
            } else {
              return h('span', '----')
            }
          }
        },
        {
          title: '净赚',
          key: 'total',
          width: 110,
          align: 'center'
        },
        {
          title: '当时库存',
          key: 'atTimeStock',
          width: 110,
          align: 'center',
          render: (h, params) => {
            if (params.row.atTimeStock) {
              return h('span', params.row.atTimeStock)
            } else {
              return h('span', '----')
            }
          }
        },
        {
          title: '现在库存',
          key: 'stock',
          sortable: true,
          width: 110,
          align: 'center',
          fixed: 'right',
          render: (h, params) => {
            if (params.row.stock) {
              return h('span', params.row.stock)
            } else {
              return h('span', '----')
            }
          }
        },
        { title: '动作',
          key: 'action',
          fixed: 'right',
          sortable: true,
          width: 100,
          align: 'center'
        },
        { title: '操作',
          key: 'handle',
          fixed: 'right',
          sortable: true,
          width: 120,
          align: 'center',
          render: (h, params) => {
            return h('Button', [
              h('router-link', {
                props: {
                  to: {
                    path: `partChart/${params.row.partId}`
                  }
                }
              },
              [
                h('span', '数据可视化')
              ])
            ])
          }
        },
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
            return h('span', new Date(params.row.createdAt).toLocaleString())
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
            let part = clonedeep(item.partsId)
            let operator = clonedeep(item.operator)
            item['partId'] = part._id
            item['deliveryPrice'] = item['deliveryPrice'] ? Number(item['deliveryPrice']) : 0
            item['deliveryStock'] = item['deliveryStock'] ? Number(item['deliveryStock']) : 0
            item['purchaseStock'] = item['purchaseStock'] ? Number(item['purchaseStock']) : 0
            item['purchasePrice'] = item['purchasePrice'] ? Number(item['purchasePrice']) : 0
            item['stock'] = Number(item['stock'])
            item['total'] = item['deliveryStock'] * item['deliveryPrice'] - item['purchaseStock'] * item['purchasePrice']
            item['price'] = Number(item['price'])
            item['atTimeStock'] = Number(item['atTimeStock'])
            item['operatorId'] = operator._id
            item.action = item['purchasePrice'] && item['purchasePrice'] !== '' ? '入库' : item['deliveryPrice'] && item['deliveryPrice'] !== '' ? '出库' : '未知操作'
            delete item.partsId
            delete item.operator
            item.createdAt = new Date(item.createdAt)
            return Object.assign(item, part, operator)
          })
          console.log(this.data)
        } else {
          this.data = res.data
          // this.$Message.error(res.msg)
        }
      })
    },
    startDate (a, b) {
      this.searchData.start = a
    },
    endDate (a, b) {
      this.searchData.end = a
    },
    changeColumns (data) {
      // console.log('data', data)
      this.columns = data
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
          searchPAndD(data, pages).then(res => {
            if (res.code === 200) {
              let data = clonedeep(res.data)
              this.page.pageSize = res.pages.pageSize
              this.page.total = res.pages.total
              this.page.page = res.pages.page
              console.log(data)
              this.data = data.map(item => {
                let part = clonedeep(item.partsId)
                let operator = clonedeep(item.operator)
                item['partId'] = part._id
                item['deliveryPrice'] = item['deliveryPrice'] ? Number(item['deliveryPrice']) : 0
                item['deliveryStock'] = item['deliveryStock'] ? Number(item['deliveryStock']) : 0
                item['purchaseStock'] = item['purchaseStock'] ? Number(item['purchaseStock']) : 0
                item['purchasePrice'] = item['purchasePrice'] ? Number(item['purchasePrice']) : 0
                item['stock'] = Number(item['stock'])
                item['total'] = item['deliveryPrice'] * item['deliveryPrice'] - item['purchaseStock'] * item['purchasePrice']
                item['price'] = Number(item['price'])
                // item['total'] =  item['deliveryPrice'] &&
                item['atTimeStock'] = Number(item['atTimeStock'])
                item['operatorId'] = operator._id
                item.action = item['purchasePrice'] && item['purchasePrice'] !== '' ? '入库' : item['deliveryPrice'] && item['deliveryPrice'] !== '' ? '出库' : '未知操作'
                delete item.partsId
                delete item.operator
                item.createdAt = new Date(item.createdAt)
                return Object.assign(item, part, operator)
              })
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
      let pages = clonedeep(this.page)
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
            item['deliveryPrice'] = item['deliveryPrice'] ? Number(item['deliveryPrice']) : 0
            item['deliveryStock'] = item['deliveryStock'] ? Number(item['deliveryStock']) : 0
            item['purchaseStock'] = item['purchaseStock'] ? Number(item['purchaseStock']) : 0
            item['purchasePrice'] = item['purchasePrice'] ? Number(item['purchasePrice']) : 0
            item['stock'] = Number(item['stock'])
            item['total'] = item['deliveryPrice'] * item['deliveryPrice'] - item['purchaseStock'] * item['purchasePrice']
            item['price'] = Number(item['price'])
            item['atTimeStock'] = Number(item['atTimeStock'])
            item['operatorId'] = operator._id
            item.action = item['purchasePrice'] && item['purchasePrice'] !== '' ? '入库' : item['deliveryPrice'] && item['deliveryPrice'] !== '' ? '出库' : '未知操作'
            delete item.partsId
            delete item.operator
            item.createdAt = new Date(item.createdAt)
            return Object.assign(item, part, operator)
          })
        } else {
          this.data = []
          this.$Message.error(res.msg ? res.msg : res.message)
        }
      })
    },
    changePageSize (pageSize) {
      const data = clonedeep(this.searchData)
      let pages = clonedeep(this.page)
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
            item['deliveryPrice'] = item['deliveryPrice'] ? Number(item['deliveryPrice']) : 0
            item['deliveryStock'] = item['deliveryStock'] ? Number(item['deliveryStock']) : 0
            item['purchaseStock'] = item['purchaseStock'] ? Number(item['purchaseStock']) : 0
            item['purchasePrice'] = item['purchasePrice'] ? Number(item['purchasePrice']) : 0
            item['stock'] = Number(item['stock'])
            item['total'] = item['deliveryPrice'] * item['deliveryPrice'] - item['purchaseStock'] * item['purchasePrice']
            item['price'] = Number(item['price'])
            item['atTimeStock'] = Number(item['atTimeStock'])
            item['operatorId'] = operator._id
            item.action = item['purchasePrice'] && item['purchasePrice'] !== '' ? '入库' : item['deliveryPrice'] && item['deliveryPrice'] !== '' ? '出库' : '未知操作'
            delete item.partsId
            delete item.operator
            item.createdAt = new Date(item.createdAt)
            return Object.assign(item, part, operator)
          })
        } else {
          this.data = []
          this.$Message.error(res.msg ? res.msg : res.message)
        }
      })
    },
    exportExcel (params) {
      this.$Spin.show()
      if (this.data.length) {
        this.exportLoading = true
        // console.log(params)
        const title = this.columns.reduce((pre, item) => {
          if (item['title'] !== '序号' && item['title'] !== '操作') {
            pre.push(item['title'])
          }
          return pre
        }, [])
        const key = this.columns.reduce((pre, item) => {
          if (item['key'] && item['key'] !== 'handle') {
            pre.push(item['key'])
          }
          return pre
        }, [])
        const data = clonedeep(this.data)
        data.forEach(item => {
          item.createdAt = item.createdAt.toLocaleString()
        })
        const params = {
          title,
          key,
          data,
          autoWidth: true,
          filename: '汽配列表'
        }
        excel.export_array_to_excel(params)
        this.$Spin.hide()
        this.exportLoading = false
      } else {
        this.$Spin.hide()
        this.$Message.info('表格数据不能为空！')
      }
    }
  }
}
</script>

<style lang="less">
  //
</style>
