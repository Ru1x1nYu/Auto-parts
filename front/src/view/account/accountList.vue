<template>
  <div>
    <Card>
      <tables ref="tables" border highlight-row searchable search-place="top" v-model="tableData" :columns="columns"/>
      <Button style="margin: 10px 0;" type="primary" @click="exportExcel">导出为Csv文件</Button>
    </Card>
  </div>
</template>

<script>
import Tables from '@/components/tables'
import { getUsersList, deleteUserInfo } from '@/api/user'
export default {
  name: 'accountList',
  components: {
    Tables
  },
  data () {
    return {
      columns: [
        {
          type: 'index',
          title: '#',
          width: 60,
          searchable: false,
          align: 'center'
        },
        { title: '用户名', key: 'userName', width: 120, searchable: true, sortable: true },
        { title: '性别', key: 'sex', searchable: true, width: 80 },
        {
          title: '头像',
          width: 120,
          searchable: false,
          key: 'avatar',
          render (h, params) {
            return h('div', [
              h('Avatar', {
                props: {
                  src: params.row.avatar,
                  size: 'large'
                }
              })
            ])
          }
        },
        { title: '年龄', key: 'age', searchable: true, width: 80 },
        { title: '所属部门', searchable: false, key: 'department', width: 100, render: (h, params) => h('span', params.row.department === '1' ? '技术部' : params.row.department === '2' ? '物流部' : '财务部') },
        { title: '手机', key: 'phone', searchable: true, width: 120 },
        { title: '电子邮箱', key: 'email', searchable: true, width: 120 },
        {
          title: '地址',
          searchable: false,
          key: 'address',
          width: 250,
          render (h, params) {
            const data = params.row.address.first && params.row.address.last ? params.row.address.first.join('') + params.row.address.last : params.row.address[0]
            return h('span', data)
          }
        },
        {
          title: '权限',
          key: 'access',
          searchable: false,
          width: 100,
          render (h, params) {
            const role = params.row.access.includes('super_admin') ? '超级管理员' : '普通管理员'
            return h('span', role)
          }
        },
        { title: '身份证号码', searchable: false, key: 'IDCard', width: 200 },
        { title: '创建时间', searchable: false, key: 'createdAt', width: 200, render: (h, params) => h('span', new Date(params.row.createdAt).toLocaleString()) },
        { title: '修改时间', searchable: false, key: 'updatedAt', width: 200, render: (h, params) => h('span', new Date(params.row.updatedAt).toLocaleString()) },
        {
          title: '操作',
          width: 120,
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
                    type: 'warning',
                    size: 'small'
                  },
                  style: {
                    marginRight: '8px'
                  },
                  on: {
                    click: () => {
                      this.$router.push({
                        path: `editOtherAccount/${params.row._id}`,
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
                    click: async () => {
                      this.$Modal.confirm({
                        title: '警告',
                        content: '<p>是否要进行删除操作</p>',
                        onOk: () => {
                          deleteUserInfo(params.row._id).then(res => {
                            if (res.code && res.code === 200) {
                              this.$Message.warning({
                                content: `${res.msg}`,
                                duration: 2
                              })
                              getUsersList().then(res => {
                                this.tableData = res
                              })
                            } else {
                              this.$Message.error(res.msg || res.message)
                            }
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
            // h('Poptip', {
            //   props: {
            //     confirm: true,
            //     placement: 'left-end',
            //     title: '你确定要删除吗?'
            //   },
            //   on: {
            //     'on-ok': () => {
            //       vm.$emit('on-delete', params)
            //       vm.$emit('input', params.tableData.filter((item, index) => index !== params.row.initRowIndex))
            //     },
            //     'on-cancel': () => {
            //       this.$Message.warn('取消操作')
            //     }
            //   }
            // })
          }
        }
      ],
      tableData: []
    }
  },
  methods: {
    exportExcel () {
      this.$refs.tables.exportCsv({
        filename: `table-${(new Date()).valueOf()}.csv`
      })
    }
  },
  mounted () {
    getUsersList().then(res => {
      console.log(res)
      this.tableData = res
    })
  }
}
</script>

<style lang="less">
  .handle{
    display: flex;
  }
</style>
