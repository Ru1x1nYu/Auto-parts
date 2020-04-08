<template>
  <div id="parts-content">
    <Form ref="partsForm" :model="partsForm" :rules="ruleValidate" :label-width="80">
        <FormItem label="型号" prop="model">
          <Input v-model="partsForm.model" :disabled="isEdit" placeholder="请输入配件型号" />
        </FormItem>
        <FormItem label="名称" prop="name">
          <Input v-model="partsForm.name" placeholder="请输入配件名称" />
        </FormItem>
        <FormItem label="条形码" prop="barCode">
          <Input v-model="partsForm.barCode" placeholder="请输入配件条形码" />
          <img id="barCode" />
        </FormItem>
        <FormItem label="适用车型" prop="apply">
          <Input v-model="partsForm.apply" placeholder="请输入配件适用车型" />
        </FormItem>
        <FormItem label="种类" prop="kind">
          <Input v-model="partsForm.kind" placeholder="请输入配件种类" />
        </FormItem>
        <FormItem label="品牌" prop="brand">
          <Input v-model="partsForm.brand" placeholder="请输入配件品牌" />
        </FormItem>
        <FormItem label="颜色" prop="color">
          <Input v-model="partsForm.color" placeholder="请输入配件颜色" />
        </FormItem>
        <FormItem label="所在位置" prop="position">
          <Input v-model="partsForm.position" placeholder="请输入配件所在仓库位置" />
        </FormItem>
        <FormItem label="产地" prop="location">
          <al-cascader
            searchable
            level="1"
            @on-change="clickUp"
            data-type="name"
            v-model="partsForm.location"
            :render-format="label => label.join('-')"
            placeholder="请输入配件产地"
          />
        </FormItem>
        <FormItem label="上传" prop="phone">
            <div class="upload">
              <Upload
                multiple
                type="drag"
                :show-upload-list="false"
                :on-success="handleSuccess"
                :format="['jpg','jpeg','png']"
                action="/upload">
                <div style="padding: 30px 0">
                    <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                    <p>单击或者拖拽图片到此处</p>
                    <p>亦或选择直接填写在线链接</p>
                </div>
              </Upload>
              <img v-if="partsForm.photoUrl" :src='partsForm.photoUrl' height="180" />
            </div>
            <Input v-model="partsForm.photoUrl" placeholder="请输入在线链接"/>
        </FormItem>
        <FormItem  label="当前库存" prop="stock">
          <Input :disabled="isEdit" v-model="partsForm.stock" placeholder="请输入配件当前库存" />
        </FormItem>
        <FormItem v-if="!isEdit" v-show="parseInt(partsForm.stock)!==0" label="入库价格" prop="purchasePrice">
          <Input v-model="partsForm.purchase.purchasePrice" placeholder="请输入配件入库价格（整数）" />
        </FormItem>
        <FormItem label="经销商" prop="agent">
          <Input v-model="partsForm.agent" placeholder="请输入配件来源经销商" />
        </FormItem>
        <FormItem label="警报线" prop="alertNumber">
          <Input v-model="partsForm.alertNumber" placeholder="请输入配件缺货报警线" />
        </FormItem>
        <FormItem label="出售价格" prop="price">
          <Input v-model="partsForm.price" placeholder="请输入配件预备出售价格" />
        </FormItem>
        <FormItem label="备注" prop="remark">
          <Input v-model="partsForm.remark" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入配件备注" />
        </FormItem>
        <FormItem>
            <Button v-if="!isEdit" :disabled="buttonFlag" type="primary" @click="handleSubmit('partsForm')">提交</Button>
            <Button v-else :disabled="buttonFlag" type="primary" @click="handleUpdate('partsForm')">修改</Button>
            <Button @click="handleReset('partsForm')" style="margin-left: 8px">Reset</Button>
        </FormItem>
    </Form>
  </div>
</template>

<script>
import jsBarCode from 'jsbarcode'
import clonedeep from 'clonedeep'
import { createPart, updatePart, getInfoById } from '@/api/parts'
import { mapGetters } from 'vuex'
export default {
  name: 'partsComponent',
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      partsForm: {
        model: '5001012-D911',
        name: '5001012-D911驾驶室铰接右支架',
        barCode: '',
        apply: '大货车',
        kind: '国产',
        brand: '一汽解放',
        color: '红色',
        location: [],
        position: '2FA25',
        remark: '一汽解放备品销售中心 原厂配件 厂家直销 长期供应 欢迎来电咨询 0431-85746414',
        photoUrl: '',
        stock: '10', // 当前库存
        agent: '长春一汽解放原厂配件公司',
        operator: '',
        price: '150', // 预测出库价格
        alertNumber: '2', // 警报线
        // 进库
        purchase: {
          purchaseStock: '0',
          purchasePrice: ''
        }
      },
      buttonFlag: false,
      ruleValidate: {
        model: [
          { required: true, message: '配件型号不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '配件名称不能为空', trigger: 'blur' }
        ],
        position: [
          { required: true, message: '配件所在位置不能为空', trigger: 'blur' }
        ],
        apply: [
          { required: true, message: '配件适用车型不能为空', trigger: 'change' }
        ],
        kind: [
          { required: true, message: '配件品牌不能为空', trigger: 'change' }
        ],
        color: [
          { required: true, message: '配件颜色不能为空', trigger: 'blur' }
        ],
        location: [
          { required: true, type: 'array', message: '配件产地不能为空' }
        ],
        remark: [
          { required: false, message: '备注不能为空', trigger: 'blur' }
        ],
        photoUrl: [
          { required: false, message: ' cannot be empty', trigger: 'blur' }
        ],
        stock: [
          { required: false, message: ' cannot be empty', trigger: 'blur' }
        ],
        agent: [
          { required: false, message: ' cannot be empty', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    console.log(this.isEdit)
    if (this.isEdit) {
      console.log(this.$route.params)
      const id = this.$route.params.id
      getInfoById(id).then(res => {
        if (res.code === 200) {
          const keys = Object.keys(this.partsForm)
          keys.forEach(item => {
            this.partsForm[item] = res.data[item]
          })
          this.partsForm.barCode ? jsBarCode('#barCode', this.partsForm.barCode, {
            format: 'CODE128',
            lineColor: '#000',
            displayValue: true,
            width: 3,
            height: 60,
            textAlign: 'center'
          }) : console.log('')
        }
      })
    } else {

    }
  },
  methods: {
    ...mapGetters(['getUserId']),
    handleSubmit (name) {
      console.log(this.partsForm)
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.buttonFlag = true
          let data = clonedeep(this.partsForm)
          data.operator = this.getUserId()
          if (Number(data.stock) !== 0) {
            data.purchase.purchaseStock = data.stock && data.stock !== '' ? data.stock : '0'
          }
          delete data.delivery
          createPart(data).then(res => {
            if (res.code === 200) {
              this.$Message.success({
                content: res.msg,
                duration: 2,
                onClose: () => {
                  this.$router.push({
                    path: 'partsLists'
                  })
                }
              })
            } else {
              this.$Message.error(res.msg)
            }
            this.buttonFlag = false
          }).catch(error => {
            this.buttonFlag = false
            this.$Message.error(error)
          })
        } else {
          this.$Message.error('未通过验证！')
        }
      })
    },
    handleUpdate (name) {
      console.log(this.partsForm)
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.buttonFlag = true
          let data = clonedeep(this.partsForm)
          data.operator = this.getUserId()
          delete data.stock
          delete data.delivery
          data._id = this.$route.params.id
          console.log(data)
          updatePart(data).then(res => {
            if (res.code === 200) {
              this.$Message.success({
                content: res.msg,
                duration: 2,
                onClose: () => {
                  this.$router.push({
                    path: '/parts/partsLists'
                  })
                }
              })
            } else {
              this.$Message.error(res.msg)
            }
            this.buttonFlag = false
          }).catch(error => {
            this.$Message.error(error)
          })
        } else {
          this.$Message.error('未通过验证！')
        }
      })
    },
    handleReset (name) {
      this.$refs[name].resetFields()
    },
    handleSuccess (response, file, fileList) {
      if (file.status && file.status === 'finished') {
        this.partsForm.photoUrl = response.url
      }
    },
    clickUp (data) {
      console.log(data)
      this.partsForm.location = data
      console.log(this.partsForm.location)
    }
  }
}
</script>

<style lang="less">
  #parts-content{
    .upload{
      display: flex;
      justify-content: space-between;
      p{
        font-size: 8px;
      }
    }
    .ivu-upload{
      width: 100%;
    }
  }
</style>
