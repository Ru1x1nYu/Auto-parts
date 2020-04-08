import axios from '@/libs/api.request'

// 入库操作
export const createDelivery = (data) => {
  return axios.request({
    url: '/delivery/createDelivery',
    data,
    method: 'post'
  })
}

// 获取入库列表
export const getDeliveryList = () => {
  return axios.request({
    url: '/delivery/getDeliveryList',
    method: 'get'
  })
}

// 通过id获取入库信息
export const getInfoById = (id) => {
  return axios.request({
    url: '/delivery/getInfoById',
    params: {
      id
    },
    method: 'get'
  })
}

// 模糊搜索-获取配件出入库全部信息
export const searchPAndD = (data, params) => {
  return axios.request({
    url: '/delivery/searchPAndD',
    data,
    params,
    method: 'post'
  })
}
