// // api.js
// import axios from 'axios'

// const baseURL = process.env.NODE_ENV === 'production'
//   ? 'http://113.44.82.167:7220/api'  // 或使用域名
//   : 'http://localhost:7220/api'

// // 创建 axios 实例
// const request = axios.create({
//   baseURL, // 基础URL
//   timeout: 1000000, // 请求超时时间
//   headers: {
//     'Content-Type': 'application/json'
//   }
// })

// api.js
import axios from 'axios'

// 修改为相对路径，让 Nginx 或同域处理
const baseURL = '/api'

// 或者统一使用后端地址，但在生产环境用 Nginx 代理
const baseURL = '/api'  // 这样请求会发到 http://113.44.82.167/api

const request = axios.create({
  baseURL,
  timeout: 1000000,
  headers: {
    'Content-Type': 'application/json'
  }
})

request.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    const res = response.data
    // 根据业务状态码处理 - 2xx 状态码都表示成功
    if (response.status < 200 || response.status >= 300) {
      // 处理错误
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  error => {
    // 对响应错误做点什么
    return Promise.reject(error)
  }
)

export default request


// api/modules/user.js
//
export function register(data) {
  return request.post('/register', data)
}

export function login(data) {
  return request.post('/login', data)
}

export function updateUser(id,data) {
  return request.post(`/updateuser/${id}`, {data})
}

// 项目相关 API
//创建项目√
export function createProject(data) {
  return request.post('/projects', data)
}

// 更新项目√
export function updateProject(id, data) {
  return request.put(`/projects/${id}`, data)
}
// 项目所有详情√
export function getProject(id) {
  return request.get(`/projects_data/${id}`)
}

// 查询项目列表√
export function getProjectList(userId) {
  return request.get(`/projects_list?userId=${userId}`)
}

// 邀请项目合作者√
export function sendInvitaion(data) {
  return request.post(`/project/invites/${data.projectId}`, data)
}

//确认项目可加入√
export function confirmInvitation(data) {
  return request.get(`/project/invites/confirm?inviteCode=${data.inviteCode}`)
}


//将合作者信息加入项目
export function addCollaborator(data) {
  return request.post(`/project/invites/${data.projectId}/collaborators`, data)
}

//TODO：将合作者计入邀请次数
export function countInvitation(data) {
  return request.post(`/project/invites/${data.projectId}/count`, data)
}

// src/utils/api.js
export function generateMusic(style) {
  return request.post('/generate-music', { style });
}
