import axios from '@/libs/api.request'

// 新增配件
export const createPart = (data) => {
  return axios.request({
    url: '/parts/create',
    data,
    method: 'post'
  })
}

// 修改配件信息
export const updatePart = (data) => {
  return axios.request({
    url: '/parts/update',
    data,
    method: 'put'
  })
}

// 获取配件列表
export const getPartsList = (params) => {
  return axios.request({
    url: '/parts/getPartsList',
    params,
    method: 'get'
  })
}

// 获取某个配件信息
export const getInfoById = (id) => {
  return axios.request({
    url: '/parts/getInfoById',
    method: 'get',
    params: {
      id
    }
  })
}

// 删除某个配件
export const deleteParts = (id) => {
  return axios.request({
    url: '/parts/delete',
    method: 'delete',
    params: {
      id
    }
  })
}

// 获取配件出入库全部信息
export const getPAndDList = () => {
  return axios.request({
    url: '/parts/getPAndDList',
    method: 'get'
  })
}

// 模糊搜索-获取配件出入库全部信息
export const searchPAndD = (data, params) => {
  return axios.request({
    url: '/parts/searchPAndD',
    data,
    params,
    method: 'post'
  })
}

// 聚合-通过配件获取报表全部信息
export const getPartsReport = (params) => {
  return axios.request({
    url: '/parts/getPartsReport',
    params,
    method: 'get'
  })
}
// 搜索-通过配件获取报表全部信息
export const searchPartsReport = (data, params) => {
  return axios.request({
    url: '/parts/searchPartsReport',
    data,
    params,
    method: 'post'
  })
}
// 聚合-通过时间获取报表全部信息
export const getDateReport = () => {
  return axios.request({
    url: '/parts/getDateReport',
    method: 'get'
  })
}
// 搜索-通过时间获取报表全部信息
export const searchDateReport = (data, params) => {
  return axios.request({
    url: '/parts/searchDateReport',
    data,
    params,
    method: 'post'
  })
}

// 查询提醒库存
export const getNotice = () => {
  return axios.request({
    url: '/parts/getNotice',
    method: 'get'
  })
}

// 查询某个配件柱形图/折线图
export const getPartChart = (id) => {
  return axios.request({
    url: '/part/getPartChart',
    params: {
      id
    },
    method: 'get'
  })
}
