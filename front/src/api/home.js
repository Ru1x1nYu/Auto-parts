import axios from '@/libs/api.request'

// 获取首页countTo数据
export const getHomeCount = () => {
  return axios.request({
    url: '/getHomeCount',
    method: 'get'
  })
}

// 获取首页合并图标数据
export const getHomeChart = () => {
  return axios.request({
    url: '/getHomeChart',
    method: 'get'
  })
}

// 获取首页饼图数据
export const getHomePie = () => {
  return axios.request({
    url: '/getHomePie',
    method: 'get'
  })
}

// 获取首页净赚数据
export const getProfitData = () => {
  return axios.request({
    url: '/getProfitData',
    method: 'get'
  })
}
