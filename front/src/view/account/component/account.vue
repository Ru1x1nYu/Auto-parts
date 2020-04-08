<template>
  <div id="register_form">
    <Form ref="formValidate" :model="accountForm" :rules="ruleValidate" :label-width="80">
        <FormItem label="账号名" prop="userName">
            <Input v-model="accountForm.userName" :disabled="isEdit || isOtherEdit" placeholder="请输入账号名"/>
        </FormItem>
        <FormItem v-if="isEdit && !isOtherEdit" label="旧密码" prop="oldPassword">
            <Input v-model="oldPassword" placeholder="请先输入旧密码"/>
        </FormItem>
        <FormItem label="密码" prop="password">
            <Input v-model="accountForm.password" placeholder="请输入密码"/>
        </FormItem>
        <FormItem label="性别" prop="sex">
            <RadioGroup v-model="accountForm.sex">
                <Radio label="man">男</Radio>
                <Radio label="woman">女</Radio>
            </RadioGroup>
        </FormItem>
        <FormItem label="年龄" prop="age">
            <Input v-model="accountForm.age" placeholder="请输入年龄"/>
        </FormItem>
        <FormItem label="手机" prop="phone">
            <Input v-model="accountForm.phone" placeholder="请输入手机"/>
        </FormItem>
        <FormItem label="邮箱" prop="email">
            <Input v-model="accountForm.email" placeholder="请输入邮箱"/>
        </FormItem>
        <FormItem label="身份证号码" prop="IDCard">
            <Input v-model="accountForm.IDCard" placeholder="请输入身份证号码"/>
        </FormItem>
        <FormItem label="上传头像" prop="phone">
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
              <img v-if="accountForm.avatar" :src='accountForm.avatar' height="180" />
            </div>
            <Input v-model="accountForm.avatar" placeholder="请输入在线链接"/>
        </FormItem>
        <FormItem label="所属部门" prop="department">
            <Select v-model="accountForm.department" :disabled="!isSuperAdmin && !isOtherEdit" placeholder="请选择所属部门">
                <Option value="1" >技术部</Option>
                <Option value="2" >物流部</Option>
                <Option value="3" >财务部</Option>
            </Select>
        </FormItem>
        <FormItem label="地址">
          <al-cascader @on-change="clickUp" data-type="name" v-model="accountForm.address.first"/>
          <Input v-model="accountForm.address.last" placeholder="请输入详细地址"/>
        </FormItem>
        <FormItem label="权限" prop="access" v-if="isSuperAdmin || isOtherEdit">
            <CheckboxGroup v-model="accountForm.access">
                <Checkbox label="super_admin">超级管理员</Checkbox>
                <Checkbox label="admin">普通管理员</Checkbox>
            </CheckboxGroup>
        </FormItem>
        <FormItem>
            <Button v-if="!isEdit && !isOtherEdit" type="primary" :disabled="buttonFlag" @click="handleSubmit('formValidate')">注册提交</Button>
            <Button v-else type="primary" :disabled="buttonFlag" @click="handleUpdate('formValidate')">修改提交</Button>
            <Button @click="handleReset('formValidate')" style="margin-left: 8px">重置</Button>
        </FormItem>
    </Form>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { createAccount, getUserInfo, getInfoById, verifyPassword, updateAccount } from '@/api/user'
export default {
  name: 'accountCompontent',
  props: {
    isEdit: {
      type: Boolean
    },
    isOtherEdit: {
      type: Boolean,
      default: false
    },
    access: {
      type: Array,
      default: () => {
        return ['admin']
      }
    }
  },
  data () {
    return {
      accountForm: {
        userName: '',
        password: '',
        avatar: '',
        sex: '',
        age: '',
        department: '',
        phone: '',
        email: '',
        address: {
          first: [],
          last: ''
        },
        access: ['admin'],
        IDCard: ''
      },
      buttonFlag: false,
      oldPassword: '',
      ruleValidate: {
        userName: [
          { required: true, type: 'string', message: '必须输入用户名', trigger: 'blur' }
        ],
        oldPassword: [
          {
            asyncValidator: (rule, value) => {
              return new Promise((resolve, reject) => {
                if (value === '') {
                  reject(new Error('必须输入旧密码'))
                } else {
                  verifyPassword(this.oldPassword).then(res => {
                    if (res.code === 200) {
                      resolve('密码验证正确')
                    }
                  }, rej => {
                    reject(new Error(rej.message))
                  })
                }
              })
            },
            trigger: 'blur'
          }
        ],
        password: [{
          required: true,
          asyncValidator: (rule, value, callback) => {
            return new Promise((resolve, reject) => {
              if (value === '') {
                callback(new Error('新密码不能为空'))
              } else if (value.length < 3) {
                callback(new Error('输入密码不能小于3'))
              } else {
                callback()
              }
            })
          },
          type: 'string',
          trigger: 'blur'
        }],
        email: [
          // { required: true, message: 'Mailbox cannot be empty', trigger: 'blur' },
          { type: 'email', message: '邮箱格式错误', trigger: 'blur' }
        ],
        address: [
          // { required: true, message: 'Please select the city', trigger: 'change' }
        ],
        sex: [
          { required: true, message: '请选择性别', trigger: 'change' }
        ],
        access: [
          { required: true, type: 'array', min: 1, message: '请选择权限', trigger: 'change' },
          { type: 'array', max: 2, message: '最多选择两个权限', trigger: 'change' }
        ],
        department: [
          { required: true, message: '必须选择一个部门', trigger: 'change' }
        ],
        phone: [
          { required: true, type: 'string', message: '必须输入手机号', trigger: 'change' }
        ],
        IDCard: [
          { required: true, type: 'string', message: '请输入身份证号码', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    isSuperAdmin: function () {
      if (this.access.includes('super_admin')) {
        return true
      } else {
        return false
      }
    },
    token: function () {
      return this.getToken()
    }
  },
  mounted () {
    if (this.isEdit && !this.isOtherEdit) {
      getUserInfo().then(res => {
        if (res.code === 200) {
          const { data } = res
          const keys = Object.keys(this.accountForm)
          keys.forEach(item => {
            this.accountForm[item] = data[item]
          })
          this.accountForm._id = data._id
        }
      })
    } else if (this.isEdit && this.isOtherEdit) {
      getInfoById(this.$route.params.id).then(res => {
        console.log(res)
        if (res.code === 200) {
          const { data } = res
          const keys = Object.keys(this.accountForm)
          keys.forEach(item => {
            this.accountForm[item] = data[item]
          })
          this.accountForm._id = data._id
          console.log(this.accountForm)
        }
      })
    }
  },
  methods: {
    ...mapGetters([
      'getToken'
    ]),
    ...mapActions([
      'getUserInfo'
    ]),
    clickUp () {
      console.log(this.accountForm.address.first)
    },
    handleSuccess (response, file, fileList) {
      if (file.status && file.status === 'finished') {
        this.accountForm.avatar = response.url
      }
    },
    handleUpdate (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.buttonFlag = true
          updateAccount(this.accountForm).then(res => {
            if (res.code === 200) {
              this.$Message.success({
                content: `${res.msg}`,
                duration: 2,
                onClose: () => {
                  this.buttonFlag = false
                  this.getUserInfo().then(res => {
                    if (res.code === 200) {
                      const { data } = res
                      const keys = Object.keys(this.accountForm)
                      keys.forEach(item => {
                        this.accountForm[item] = data[item]
                      })
                      this.accountForm._id = data._id
                    }
                  })
                }
              })
            }
          }, rej => {
            console.log('rej', rej)
          }).catch(error => {
            console.log(error)
          })
        } else {
          this.$Message.error('输入验证失败！')
        }
      })
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.buttonFlag = true
          createAccount(this.accountForm).then(res => {
            if (res.code && res.code === 200) {
              this.$Message.success({
                content: '添加帐号成功！',
                duration: 2,
                onClose: () => {
                  this.buttonFlag = false
                  this.$router.push({
                    path: 'accountList'
                  })
                }
              })
            } else {
              this.$Message.error({
                content: res.message,
                duration: 3
              })
            }
          })
        } else {
          this.$Message.error('输入验证失败！')
        }
      })
    },
    handleReset (name) {
      this.$refs[name].resetFields()
    }
  }
}
</script>

<style lang="less">
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
</style>
