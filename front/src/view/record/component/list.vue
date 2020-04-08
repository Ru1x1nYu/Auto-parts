<template>
  <div id="record-list">
    <Card>
      <Card title="模糊查询">
        <slot></slot>
      </Card>
      <Card class="table-card">
        <Button type="primary" @click="modal1 = true" style="margin-bottom: 10px;">筛选数据</Button>
        <Modal
          v-model="modal1"
          title="选择要过滤的字段名"
          @on-ok="ok"
          @on-cancel="cancel"
        >
        <Form :label-width="80">
          <FormItem label="columnsBox" prop="columnsBox">
            <CheckboxGroup v-model="columnsBox">
              <Checkbox label="model">型号</Checkbox>
              <Checkbox label="name">名称</Checkbox>
              <Checkbox label="barCode">二维码</Checkbox>
              <Checkbox label="apply">适用车型</Checkbox>
              <Checkbox label="kind">种类</Checkbox>
              <Checkbox label="brand">品牌</Checkbox>
              <Checkbox label="photoUrl">照片</Checkbox>
              <Checkbox label="price">预售价格</Checkbox>
              <Checkbox label="userName">操作者</Checkbox>
            </CheckboxGroup>
          </FormItem>
        </Form>
        </Modal>
        <Table :loading="loading" :columns="columns" :data="data" border :no-data-text="tableText" show-summary :summary-method="handleSummary"></Table>
        <br>
        <Spin size="large" fix v-if="loading && data.length !== 0">等待中</Spin>
        <Spin size="large" fix v-if="loading && data.length === 0">无数据</Spin>
        <slot name="page"></slot>
      </Card>
    </Card>
  </div>
</template>

<script>
export default {
  name: 'listComponent',
  props: {
    flag: {
      type: String
    },
    columns: {
      type: Array,
      default: () => {
        return []
      }
    },
    columnsList: {
      type: Array,
      default: () => {
        return []
      }
    },
    data: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      columnsBox: [],
      modal1: false,
      tableText: '当前没有数据！'
      // loading: true,
    }
  },
  computed: {
    loading: function () {
      // console.log(this.data)
      if (this.data && this.data.length !== 0 && this.columns && this.columns.length !== 0) {
        return false
      } else {
        return true
      }
    }
  },
  methods: {
    ok () {
      const res = this.columnsList.filter(item => {
        if (this.columnsBox.includes(item.key)) {
          return false
        } else {
          return true
        }
      })
      this.$emit('columnsMehtod', res)
    },
    cancel () {
      this.$Message.info('取消操作')
    },
    handleSummary ({ columns, data }) {
      const sums = {}
      columns.forEach((column, index) => {
        const key = column.key
        if (index === 0) {
          sums[key] = {
            key,
            value: '总计'
          }
          return
        }
        const values = data.map(item => Number(item[key]))
        if (key !== 'barCode' && key !== 'createdAt' & !values.every(value => isNaN(value))) {
          const v = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
          sums[key] = {
            key,
            value: v
          }
        } else {
          sums[key] = {
            key,
            value: ''
          }
        }
      })
      return sums
    }
  }
}
</script>

<style lang="less">
  #record-list{
    .search-form{
      display: flex;
      flex-wrap: wrap;
      .ivu-form-item{
        margin-right: 60px;
      }
    }
    .table-card{
      margin-top: .5em;
    }
  }
</style>
