import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'

const request = axios.create({
  baseURL,
  timeout: 1000000,
  headers: {
    'Content-Type': 'application/json'
  }
})

request.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
)

export default request

export function register(data) {
  return request.post('/register', data)
}

export function login(data) {
  return request.post('/login', data)
}

export function updateUser(id, data) {
  return request.post(`/updateuser/${id}`, { data })
}

export function createProject(data) {
  return request.post('/projects', data)
}

export function updateProject(id, data) {
  return request.put(`/projects/${id}`, data)
}

export function getProject(id) {
  return request.get(`/projects_data/${id}`)
}

export function getProjectList(userId) {
  return request.get(`/projects_list?userId=${userId}`)
}

export function sendInvitaion(data) {
  return request.post(`/project/invites/${data.projectId}`, data)
}

export function confirmInvitation(data) {
  return request.get(`/project/invites/confirm?inviteCode=${data.inviteCode}`)
}

export function addCollaborator(data) {
  return request.post(`/project/invites/${data.projectId}/collaborators`, data)
}

export function countInvitation(data) {
  return request.post(`/project/invites/${data.projectId}/count`, data)
}

export function generateMusic(style) {
  return request.post('/generate-music', { style })
}
