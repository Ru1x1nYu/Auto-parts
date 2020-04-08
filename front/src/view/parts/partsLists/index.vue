<template>
  <div>
    <Card title="导出EXCEL">
      <Row>
        <Button icon="md-download" :loading="exportLoading" @click="exportExcel">导出文件</Button>
      </Row>
    </Card>
    <Card>
      <Row class="margin-top-10">
        <tables ref="tables" border editable searchable search-place="top" v-model="tableData" :columns="columns"/>
        <Page slot="page" :page-size-opts="[10,20,40,80,120,200]" :current="Number(page.page)" :page-size="Number(page.pageSize)" :total="Number(page.total)" show-total show-sizer @on-change="changePage" @on-page-size-change="changePageSize" />
    </Row>
    </Card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import excel from '@/libs/excel'
import clonedeep from 'clonedeep'
import Tables from '@/components/tables'
import { getPartsList, deleteParts } from '@/api/parts'
import { createPurchase } from '@/api/purchase'
import { createDelivery } from '@/api/delivery'
export default {
  name: 'partsList',
  components: {
    Tables
  },
  data () {
    return {
      exportLoading: false,
      page: {
        total: 0,
        page: 1,
        pageSize: 10
      },
      columns: [
        {
          type: 'index',
          // key: 'index',
          title: '#',
          width: 60,
          searchable: false,
          align: 'center'
        },
        { title: '型号', key: 'model', width: 120, searchable: true, sortable: true, align: 'center' },
        { title: '名称', key: 'name', searchable: true, width: 180, align: 'center' },
        {
          title: '条形码',
          width: 200,
          searchable: true,
          key: 'barCode',
          align: 'center',
          render: (h, params) => {
            return h('div', params.row.barCode)
          }
        },
        { title: '适用车型', key: 'apply', searchable: true, width: 100, align: 'center' },
        { title: '种类', searchable: false, key: 'kind', width: 80, align: 'center' },
        { title: '品牌', key: 'brand', searchable: true, width: 120, align: 'center' },
        { title: '颜色', key: 'color', searchable: true, width: 80, align: 'center' },
        { title: '所在位置', key: 'position', searchable: true, width: 120, align: 'center' },
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
        {
          title: '产地',
          searchable: false,
          align: 'center',
          key: 'location',
          width: 150,
          render (h, params) {
            const data = params.row.location && params.row.location.join('')
            return h('span', data)
          }
        },
        { title: '警报线', key: 'alertNumber', searchable: true, width: 80, align: 'center' },
        { title: '库存', key: 'stock', searchable: true, width: 80, align: 'center' },
        { title: '经销商', key: 'agent', searchable: true, width: 120, align: 'center' },
        { title: '预售价格', key: 'price', searchable: true, width: 90, align: 'center' },
        { title: '备注', key: 'remark', searchable: true, width: 260, align: 'center' },
        {
          title: '操作人',
          key: 'operator',
          searchable: true,
          width: 100,
          align: 'center',
          render (h, params) {
            const data = params.row.operator && params.row.operator.userName
            return h('span', data)
          }
        },
        { title: '创建时间', key: 'createdAt', searchable: false, width: 120, align: 'center', render: (h, params) => h('span', new Date(params.row.createdAt).toLocaleString()) },
        { title: '上次修改时间', key: 'updatedAt', searchable: false, width: 120, align: 'center', render: (h, params) => h('span', new Date(params.row.updatedAt).toLocaleString()) },

        {
          title: '操作',
          width: 110,
          fixed: 'right',
          searchable: false,
          // key: 'handle',
          render: (h, params) => {
            return h('div',
              {
                class: 'handle'
              },
              [
                h('Button', {
                  props: {
                    type: 'success',
                    size: 'small'
                  },
                  style: {
                    marginRight: '8px'
                  },
                  on: {
                    click: () => {
                      this.purchase = {
                        purchasePrice: '',
                        purchaseStock: ''
                      }
                      this.$Modal.confirm({
                        title: '入库提醒',
                        width: '600',
                        loading: true,
                        closable: true,
                        onOk: () => {
                          const data = clonedeep(this.purchase)
                          data.partsId = params.row._id
                          data.operator = this.getUserId()
                          console.log(data, params.row)
                          createPurchase(data).then(res => {
                            if (res.code === 200) {
                              this.$Message.success({
                                content: res.msg
                              })
                            } else {
                              this.$Message.error(res.msg)
                            }
                            getPartsList().then(res => {
                              if (res.code === 200) {
                                this.tableData = res.data
                              }
                            })
                          }).finally(() => {
                            this.$Modal.remove() // 关闭模态框
                          })
                        },
                        onCancel: () => {
                          console.log('cancel', this.purchase.purchasePrice, this.purchase.purchaseStock)
                        },
                        render: (h) => {
                          return h('Form', {
                            props: {
                              'label-width': 100,
                              value: this.purchase,
                              autofocus: true
                            }
                          },
                          [
                            h('FormItem', {
                              props: {
                                label: '入库价格',
                                prop: 'purchasePrice'
                              }
                            },
                            [
                              h('Input', {
                                attrs: {
                                  type: 'number'
                                },
                                props: {
                                  value: this.purchase.purchasePrice,
                                  autofocus: true,
                                  placeholder: `请输入【${params.row.name}】入库价格`
                                },
                                on: {
                                  input: (val) => {
                                    this.purchase.purchasePrice = val
                                  }
                                }
                              })
                            ]),
                            h('FormItem', {
                              props: {
                                label: '入库数量',
                                prop: 'purchaseStock'
                              }
                            },
                            [
                              h('Input', {
                                attrs: {
                                  type: 'number'
                                },
                                props: {
                                  value: this.purchase.purchaseStock,
                                  autofocus: true,
                                  placeholder: `请输入【${params.row.name}】入库数量`
                                },
                                on: {
                                  input: (val) => {
                                    this.purchase.purchaseStock = val
                                  }
                                }
                              })
                            ]),
                            h('FormItem', {
                              props: {
                                label: '备注',
                                prop: 'purchaseRemark'
                              }
                            },
                            [
                              h('Input', {
                                props: {
                                  value: this.purchase.purchaseRemark,
                                  autofocus: true,
                                  placeholder: `请输入【${params.row.name}】备注`
                                },
                                on: {
                                  input: (val) => {
                                    this.purchase.purchaseRemark = val
                                  }
                                }
                              })
                            ])
                          ]
                          )
                        }
                      })
                    }
                  }
                }, '入库'),
                h('Button', {
                  props: {
                    type: 'warning',
                    size: 'small'
                  },
                  style: {
                    marginRight: '8px'
                  },
                  on: {
                    // 出库
                    click: () => {
                      this.delivery = {
                        deliveryPrice: params.row.price,
                        deliveryStock: ''
                      }
                      this.$Modal.confirm({
                        title: '出库提醒',
                        width: '600',
                        loading: true,
                        closable: true,
                        onOk: () => {
                          const data = clonedeep(this.delivery)
                          data.partsId = params.row._id
                          data.operator = this.getUserId()
                          console.log(data, params.row)
                          createDelivery(data).then(res => {
                            if (res.code === 200) {
                              this.$Message.success({
                                content: res.msg
                              })
                            } else {
                              this.$Message.error(res.msg)
                            }
                            getPartsList().then(res => {
                              if (res.code === 200) {
                                this.tableData = res.data
                              }
                            })
                          }).finally(() => {
                            this.$Modal.remove() // 关闭模态框
                          })
                          console.log('ok', this.delivery.deliveryPrice, this.delivery.deliveryStock)
                        },
                        onCancel: () => {
                          console.log('cancel', this.delivery.deliveryPrice, this.delivery.deliveryStock)
                        },
                        render: (h) => {
                          return h('Form', {
                            props: {
                              'label-width': 100,
                              value: this.delivery,
                              autofocus: true
                            }
                          },
                          [
                            h('FormItem', {
                              props: {
                                label: '出库价格',
                                prop: 'deliveryPrice'
                              }
                            },
                            [
                              h('Input', {
                                attrs: {
                                  type: 'number'
                                },
                                props: {
                                  value: this.delivery.deliveryPrice,
                                  autofocus: true,
                                  placeholder: `请输入【${params.row.name}】出库价格`
                                },
                                on: {
                                  input: (val) => {
                                    this.delivery.deliveryPrice = val
                                  }
                                }
                              })
                            ]),
                            h('FormItem', {
                              props: {
                                label: '出库数量',
                                prop: 'deliveryStock'
                              }
                            },
                            [
                              h('Input', {
                                attrs: {
                                  type: 'number'
                                },
                                props: {
                                  value: this.delivery.deliveryStock,
                                  autofocus: true,
                                  placeholder: `请输入【${params.row.name}】出库数量`
                                },
                                on: {
                                  input: (val) => {
                                    this.delivery.deliveryStock = val
                                  }
                                }
                              })
                            ]),
                            h('FormItem', {
                              props: {
                                label: '备注',
                                prop: 'deliveryRemark'
                              }
                            },
                            [
                              h('Input', {
                                props: {
                                  value: this.delivery.deliveryRemark,
                                  autofocus: true,
                                  placeholder: `请输入【${params.row.name}】备注`
                                },
                                on: {
                                  input: (val) => {
                                    this.delivery.deliveryRemark = val
                                  }
                                }
                              })
                            ])
                          ]
                          )
                        }
                      })
                    }
                  }
                }, '出库'),
                h('Button', {
                  props: {
                    type: 'info',
                    size: 'small'
                  },
                  style: {
                    marginRight: '8px'
                  },
                  on: {
                    click: () => {
                      this.$router.push({
                        path: `editParts/${params.row._id}`,
                        keepAlive: false
                      })
                    }
                  }
                }, '编辑'),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  style: {
                    marginRight: '8px'
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: '警告',
                        content: '<p>是否要进行删除操作</p>',
                        onOk: () => {
                          deleteParts(params.row._id).then(res => {
                            this.$Spin.show()
                            if (res.code && res.code === 200) {
                              this.$Message.success({
                                content: `${res.msg}`,
                                duration: 2
                              })
                              getPartsList().then(res => {
                                if (res.code === 200) {
                                  this.tableData = res.data
                                }
                              })
                            }
                          }).finally(() => {
                            this.$Spin.hide()
                          })
                          // 删除接口 回调刷新
                        },
                        onCancel: () => {
                          this.$Message.info('操作取消！')
                        }
                      })
                    }
                  }
                }, '删除')
              ])
          }
        }
      ],
      tableData: [],
      purchase: {
        partsId: '',
        purchasePrice: '',
        purchaseStock: '',
        purchaseRemark: '',
        operator: ''
      },
      delivery: {
        partsId: '',
        deliveryPrice: '',
        deliveryStock: '',
        deliveryRemark: '',
        operator: ''
      }
    }
  },
  methods: {
    ...mapGetters(['getUserId']),
    exportExcel (params) {
      this.$Spin.show()
      if (this.tableData.length) {
        this.exportLoading = true
        // console.log(params)
        const title = this.columns.reduce((pre, item) => {
          if (item['title'] !== '#' && item['title'] !== '操作') {
            pre.push(item['title'])
          }
          return pre
        }, [])
        const key = this.columns.reduce((pre, item) => {
          if (item['key']) {
            pre.push(item['key'])
          }
          return pre
        }, [])
        const data = clonedeep(this.tableData)
        data.forEach((item) => {
          const location = item.location.join('')
          const userName = item.operator.userName
          delete item.operator
          delete item.location
          item.operator = userName
          item.location = location
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
    },
    changePageSize (pageSize) {
      const pages = clonedeep(this.page)
      pages.pageSize = pageSize
      getPartsList(pages).then(res => {
        if (res.code === 200) {
          this.tableData = res.data
          this.page.pageSize = res.pages.pageSize
          this.page.total = res.pages.total
          this.page.page = res.pages.page
        }
      })
    },
    changePage (page) {
      const pages = clonedeep(this.page)
      pages.page = page
      getPartsList(pages).then(res => {
        if (res.code === 200) {
          this.tableData = res.data
          this.page.pageSize = res.pages.pageSize
          this.page.total = res.pages.total
          this.page.page = res.pages.page
        }
      })
    }
  },
  mounted () {
    const pages = clonedeep(this.page)
    getPartsList(pages).then(res => {
      if (res.code === 200) {
        this.tableData = res.data
        this.page.pageSize = res.pages.pageSize
        this.page.total = res.pages.total
        this.page.page = res.pages.page
      }
    })
  }
}
</script>

<style lang="less">
  .handle{
    display: flex;
    flex-wrap:wrap;
    margin: 6px 0;
    button{
      &:nth-child(1){
        margin-bottom: 4px;
      }
      &:nth-child(2){
        margin-bottom: 4px;
        margin-right: 0px !important;
      }
      &:nth-child(4){
        margin-right: 0px !important;
      }
    }
  }
  .ivu-table-cell{
    padding-left: 10px;
    padding-right: 10px;
  }
  .demo-spin-icon-load{
    animation: ani-demo-spin 1s linear infinite;
  }
</style>
