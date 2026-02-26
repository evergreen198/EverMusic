// api.js
import axios from 'axios'

const baseURL = 'http://localhost:7220/api'
// 创建 axios 实例
const request = axios.create({
  baseURL, // 基础URL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
// request.interceptors.request.use(
//   config => {
//     // 在发送请求之前做些什么，比如添加 token
//     const token = localStorage.getItem('token')
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`
//     }
//     return config
//   },
//   error => {
//     return Promise.reject(error)
//   }
// )

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    const res = response.data
    // 根据业务状态码处理
    if (response.status !== 200) {
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

export function register(data) {
  return request.post('/register', data)
}

export function login(data) {

  return request.post('/login', data)


}

// export function getUserInfo(id) {
//   return request.get(`/user/${id}`)
// }

// // api/modules/article.js
// import request from '@/utils/request'

// export function getArticles(params) {
//   return request.get('/articles', { params })
// }

// export function createArticle(data) {
//   return request.post('/articles', data)
// }

