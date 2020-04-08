import axios from '@/libs/api.request'

// 注册帐号
export const createAccount = (data) => {
  return axios.request({
    url: '/users/create',
    data,
    method: 'post'
  })
}

// 修改帐号信息
export const updateAccount = (data) => {
  return axios.request({
    url: '/users/update',
    data,
    method: 'put'
  })
}

// 获取帐号列表信息
export const getUsersList = (data) => {
  return axios.request({
    url: '/users/getUsersList',
    method: 'get'
  })
}

// 验证密码正确
export const verifyPassword = (password) => {
  return axios.request({
    url: '/users/verifyPassword',
    data: {
      'password': password
    },
    method: 'post'
  })
}

// 登录
export const login = ({ userName, password }) => {
  const data = {
    userName,
    password
  }
  return axios.request({
    url: '/users/login',
    data,
    method: 'post'
  })
}

// 上传头像
export const upload = () => {
  return axios.request({
    url: '/upload',
    method: 'get'
  })
}

// 删除用户信息
export const deleteUserInfo = (id) => {
  return axios.request({
    url: '/users/delete',
    params: {
      id
    },
    method: 'get'
  })
}

// 从params获取用户信息
export const getInfoById = (id) => {
  return axios.request({
    url: '/users/getInfoById',
    params: {
      id
    },
    method: 'get'
  })
}

// 从Authorization获取用户信息
export const getUserInfo = () => {
  return axios.request({
    url: '/users/getInfo',
    method: 'get'
  })
}

export const logout = (token) => {
  return axios.request({
    url: 'logout',
    method: 'post'
  })
}

export const getMessage = () => {
  return axios.request({
    url: 'message/init',
    method: 'get'
  })
}

export const getContentByMsgId = msg_id => {
  return axios.request({
    url: 'message/content',
    method: 'get',
    params: {
      msg_id
    }
  })
}

export const hasRead = msg_id => {
  return axios.request({
    url: 'message/has_read',
    method: 'post',
    data: {
      msg_id
    }
  })
}

export const removeReaded = msg_id => {
  return axios.request({
    url: 'message/remove_readed',
    method: 'post',
    data: {
      msg_id
    }
  })
}

export const restoreTrash = msg_id => {
  return axios.request({
    url: 'message/restore',
    method: 'post',
    data: {
      msg_id
    }
  })
}
