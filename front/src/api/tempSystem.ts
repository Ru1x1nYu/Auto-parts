import request from '@/utils/request'

// 获得楼层区域
export const getAreaList = () => {
  return request({
    url: '/floors',
    method: 'get'
  })
}

// 获得该层楼的设备
export const getDevice = (params: any) => {
  return request({
    url: '/devices/values',
    method: 'get',
    params
  })
}
