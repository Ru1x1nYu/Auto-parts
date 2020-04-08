import axios from 'axios'
import Cookies from 'js-cookie'
import Vue from 'vue'
// import { Spin } from 'iview'

class HttpRequest {
  constructor (baseUrl = baseURL) {
    this.baseUrl = baseUrl
    this.queue = {}
  }
  getInsideConfig () {
    const token = Cookies.get('token') ? Cookies.get('token') : ''
    const config = {
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${token}`
        //
      }
    }
    return config
  }
  destroy (url) {
    delete this.queue[url]
    if (!Object.keys(this.queue).length) {
      // Spin.hide()
    }
  }
  interceptors (instance, url) {
    // 请求拦截
    instance.interceptors.request.use(config => {
      // 添加全局的loading...
      if (!Object.keys(this.queue).length) {
        // Spin.show() // 不建议开启，因为界面不友好
      }
      this.queue[url] = true
      return config
    }, error => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use(res => {
      this.destroy(url)
      const { data, status } = res
      console.log(status, res)
      if (status && status === 200) {
        return data
      }
      console.log(res.config.url, res.data)
    }, error => {
      this.destroy(url)
      let errorInfo = error.response
      const { data } = errorInfo
      let errors = ''
      if (data.errors && data.errors.length !== 0) {
        errors = data.errors.reduce((pre, item) => {
          return pre + `${item.field}：${item.message}\n`
        }, '')
      } else {
        errors = data.message
      }
      Vue.prototype.$Message.error({
        content: `${errorInfo.status}：${errors}`,
        duration: 5
      })
      if (!errorInfo) {
        const { request: { statusText, status }, config } = JSON.parse(JSON.stringify(error))
        errorInfo = {
          statusText,
          status,
          request: { responseURL: config.url }
        }
      }
      // addErrorLog(errorInfo)
      // console.log(errorInfo)
      return data
    })
  }
  request (options) {
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(), options)
    this.interceptors(instance, options.url)
    return instance(options)
  }
}
export default HttpRequest
