import request from '@/utils/request'

export const getGraphsData = (params: any) =>
  request({
    url: '/api/v1/query_range',
    method: 'get',
    baseURL: 'http://172.172.1.15:9090/',
    params
  })

export const getLabelList = () =>
  request({
    url: '/api/v1/label/__name__/values',
    method: 'get',
    baseURL: 'http://172.172.1.15:9090/'
  })
