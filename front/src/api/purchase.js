import axios from '@/libs/api.request'

// 入库操作
export const createPurchase = (data) => {
  return axios.request({
    url: '/purchase/createPurchase',
    data,
    method: 'post'
  })
}

// 获取入库列表
export const getPurchaseList = () => {
  return axios.request({
    url: '/purchase/getPurchaseList',
    method: 'get'
  })
}

// 通过id获取入库信息
export const getInfoById = (params) => {
  return axios.request({
    url: '/purchase/getInfoById',
    params,
    method: 'get'
  })
}

// 模糊搜索-获取配件出入库全部信息
export const searchPAndD = (data, params) => {
  return axios.request({
    url: '/purchase/searchPAndD',
    data,
    params,
    method: 'post'
  })
}
