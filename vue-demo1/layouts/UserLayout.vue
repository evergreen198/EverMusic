<template>
  <div class="User">
    <div v-if="editorHandle" class="info-editor-back" @click="closeEditor">
      <div class="info-editor" @click.stop>
        <div class="editor-header">
          <h3>编辑个人资料</h3>
          <button class="close-btn" @click="closeEditor">×</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <!-- 头像修改 -->
          <div class="form-group">
            <label>头像</label>
            <div class="avatar-upload">
              <div class="avatar-preview">
                <img :src="formData.avatar_url" alt="头像预览" class="avatar-img" />
                <input
                  type="file"
                  ref="fileInput"
                  accept="image/*"
                  @change="handleAvatarChange"
                  class="file-input"
                />
                <div class="upload-overlay" @click="triggerFileInput">
                  <span class="upload-icon">📷</span>
                  <span class="upload-text">更换头像</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 昵称 -->
          <div class="form-group">
            <label for="username">昵称</label>
            <input
              type="text"
              id="username"
              v-model="formData.username"
              placeholder="请输入昵称"
              class="form-input"
              maxlength="20"
            />
            <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
          </div>

          <!-- 个性签名 -->
          <div class="form-group">
            <label for="bio">个性签名</label>
            <textarea
              id="bio"
              v-model="formData.bio"
              placeholder="请输入个性签名"
              class="form-textarea"
              rows="3"
              maxlength="100"
            ></textarea>
            <span v-if="errors.bio" class="error-message">{{ errors.bio }}</span>
          </div>

          <!-- 密码 -->
          <div class="form-group">
            <label for="password">密码</label>
            <input
              type="password"
              id="password"
              v-model="formData.password"
              placeholder="留空表示不修改密码"
              class="form-input"
            />
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <!-- 确认密码 -->
          <div class="form-group">
            <label for="confirmPassword">确认密码</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="formData.confirmPassword"
              placeholder="请再次输入密码"
              class="form-input"
            />
            <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
          </div>

          <!-- 邮箱/不可修改 -->
          <div class="form-group">
            <label>邮箱</label>
            <input
              type="email"
              v-model="formData.email"
              class="form-input disabled"
              disabled
            />
          </div>

          <!-- 提交按钮 -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeEditor">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? '保存中...' : '保存修改' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <SideBarAsider></SideBarAsider>
    <div class="right">
      <!-- 用户信息卡片 -->
      <div class="user-profile">
        <div class="profile-header">
          <div class="avatar-container">
            <img
              :src="user.avatar_url || '/img/pexels-ecaterina-susu-1790735746-29779303.jpg'"
              alt="用户头像"
              class="avatar"
            />
          </div>
          <div class="user-info">
            <h2 class="username">{{ user.username || '音乐创作者' }}</h2>
            <p class="bio">{{ user.bio || '热爱音乐，享受创作的过程，希望用音乐传递美好。' }}</p>
            <div class="stats">
              <div class="stat-item">
                <span class="stat-value">{{ works.length }}</span>
                <span class="stat-label">作品</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">0</span>
                <span class="stat-label">粉丝</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">0</span>
                <span class="stat-label">关注</span>
              </div>
            </div>
          </div>
          <div class="user-function">
            <button @click="useEditorHandle" class="edit-btn">
              修改资料
            </button>
            <button @click="handleLogout" class="logout-btn">
              退出登录
            </button>
          </div>
        </div>
      </div>

      <!-- 作品展示 -->
      <div class="user-works">
        <h3 class="works-title">我的作品</h3>
        <div  class="works-grid">
          <div
            v-for="(work, index) in works"
            :key="work.id || index"
            class="work-item"
            :data-work-id="work.id"
            @click="handleLoadProject(work.id)"
          >
            <div class="work-thumbnail">
              <div class="thumbnail-placeholder"></div>
              <div class="play-button">▶</div>
            </div>
            <div class="work-info">
              <h4 class="work-title">{{ work.title }}</h4>
              <p class="work-meta">{{ work.updated_at }} • {{ work.duration_second }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SideBarAsider from '../src/components/SideBarAsider.vue'
import { ref, onMounted, onUnmounted,onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import {getProjectList,updateUser } from '../src/utils/api.js';

const router = useRouter()
const editorHandle=ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function handleLogout() {
  // 删除localStorage中的认证信息
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  // 重定向到登录页面
  router.push('/auth')
}
// 表单数据
const formData = ref({
  username: '',
  bio: '',
  avatar_url: '',
  password: '',
  confirmPassword: '',
  email: ''
})

// 错误信息
const errors = ref({
  username: '',
  bio: '',
  password: '',
  confirmPassword: ''
})

// 加载状态
const isSubmitting = ref(false)

const useEditorHandle=()=>{
  editorHandle.value=!editorHandle.value
  if (editorHandle.value) {
    // 打开编辑器时，初始化表单数据
    initializeFormData()
  }
}

// 关闭编辑器
const closeEditor = () => {
  editorHandle.value = false
  // 重置表单和错误信息
  resetForm()
}

// 初始化表单数据
const initializeFormData = () => {
  // 优先使用localStorage中的数据
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const userData = JSON.parse(userStr)
      formData.value = {
        username: userData.username || '',
        bio: userData.bio || '',
        avatar_url: userData.avatar_url || '/img/pexels-ecaterina-susu-1790735746-29779303.jpg',
        password: '',
        confirmPassword: '',
        email: userData.email || 'user@example.com'
      }
    } catch (error) {
      console.error('解析用户信息失败:', error)
      // 解析失败时使用当前用户数据
      formData.value = {
        username: user.value.username || '',
        bio: user.value.bio || '',
        avatar_url: user.value.avatar_url || '/img/pexels-ecaterina-susu-1790735746-29779303.jpg',
        password: '',
        confirmPassword: '',
        email: 'user@example.com'
      }
    }
  } else {
    // 没有localStorage数据时使用当前用户数据
    formData.value = {
      username: user.value.username || '',
      bio: user.value.bio || '',
      avatar_url: user.value.avatar_url || '/img/pexels-ecaterina-susu-1790735746-29779303.jpg',
      password: '',
      confirmPassword: '',
      email: 'user@example.com'
    }
  }
}

// 重置表单
const resetForm = () => {
  errors.value = {
    username: '',
    bio: '',
    password: '',
    confirmPassword: ''
  }
  formData.value.password = ''
  formData.value.confirmPassword = ''
}

// 触发文件输入
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// 处理头像变化
const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 这里可以添加文件大小和类型验证
    if (file.size > 5 * 1024 * 1024) {
      alert('头像文件大小不能超过5MB')
      return
    }

    // 预览头像
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.avatar_url = e.target!.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 验证表单
const validateForm = () => {
  let isValid = true

  // 重置错误信息
  errors.value = {
    username: '',
    bio: '',
    password: '',
    confirmPassword: ''
  }

  // 验证昵称
  if (!formData.value.username.trim()) {
    errors.value.username = '昵称不能为空'
    isValid = false
  } else if (formData.value.username.length < 2 || formData.value.username.length > 20) {
    errors.value.username = '昵称长度应在2-20个字符之间'
    isValid = false
  }

  // 验证个性签名
  if (formData.value.bio && formData.value.bio.length > 100) {
    errors.value.bio = '个性签名不能超过100个字符'
    isValid = false
  }

  // 验证密码
  if (formData.value.password) {
    if (formData.value.password.length < 6) {
      errors.value.password = '密码长度不能少于6个字符'
      isValid = false
    } else if (formData.value.password !== formData.value.confirmPassword) {
      errors.value.confirmPassword = '两次输入的密码不一致'
      isValid = false
    }
  }

  return isValid
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  const userid=JSON.parse(localStorage.getItem("user") as string).id
  isSubmitting.value = true

  try {

    updateUser(userid,formData.value)

    console.log('提交的表单数据:', formData.value)

    // 准备更新的用户数据
    const updatedUserData = {
      ...user.value,
      username: formData.value.username,
      bio: formData.value.bio,
      avatar_url: formData.value.avatar_url,
      email: formData.value.email
    }

    // 更新localStorage中的用户信息
    localStorage.setItem('user', JSON.stringify(updatedUserData))

    // 更新本地用户信息
    user.value = {
      ...updatedUserData
    }

    // 关闭编辑器
    closeEditor()

    // 显示成功提示
    alert('个人资料修改成功！')
  } catch (error) {
    console.error('修改个人资料失败:', error)
    alert('修改个人资料失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

// 用户信息管理
// class userDataType{
//     bio:string,
//     created_at:string,
//     email:string,
//     id:numebr,
//     password_hash:string,
//     username:string
//   }
interface userData{
  id:number,
  username:string,
  bio:string,
  avatar_url:string
}
const user = ref<userData>({
  id:0,
  username: '音乐创作者',
  bio: '热爱音乐，享受创作的过程，希望用音乐传递美好。',
  avatar_url: '/img/pexels-ecaterina-susu-1790735746-29779303.jpg'
});

// 模拟作品数据
interface Work {
  title: string;
  updated_at: string;
  duration_second: string;
  id:number
}

const works = ref<Work[]>([])

// 加载状态
const loading = ref(true)
// const error = ref('')

// 从localStorage获取用户信息
const loadUserInfo = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      user.value = {
        id:userData.id || user.value.id,
        username: userData.username || user.value.username,
        bio: userData.bio || user.value.bio,
        avatar_url: userData.avatar_url || user.value.avatar_url
      };
    } catch (error) {
      console.error('解析用户信息失败:', error);
      // 保持默认值
    }
  }
  loading.value = false;
};

// 监听localStorage变化，实时更新用户信息
const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'user') {
    loadUserInfo();
  }
};
onBeforeMount(()=>{
  LoadHistoryProject()

})
// 组件挂载时获取用户信息
onMounted(() => {
  loadUserInfo();
  // 监听localStorage变化
  window.addEventListener('storage', handleStorageChange);
});

// 组件卸载时清理事件监听
onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange);
});

async function LoadHistoryProject(){
  const userStr = localStorage.getItem('user');
  console.log(userStr);

  const currentUser = userStr ? JSON.parse(userStr) : null;
  const userId = currentUser?.id || null;

  if (!userId) {
    alert('请先登录');
    return;
  }

  try {
    const response = await getProjectList(userId);
    //@ts-expect-error 已在后端设置返回值为与Work[]的同类型
    works.value=response
    console.log(works.value);

  } catch (error) {
    console.error('获取历史作品失败:', error);
    //@ts-expect-error 已在后端设置erroe返回值
    error.value = '获取历史作品失败，请重试'
    works.value = []  // 出错时设为空数组
  } finally {
    loading.value = false
  }
}

// 点击作品加载项目
const handleLoadProject = (projectId: number) => {
  if (!projectId) {
    console.error('项目ID不存在');
    return;
  }
  // 使用路由导航到编辑器页面，通过state传递项目ID
  router.push({
    path: '/',
    state: { projectId: projectId.toString() }
  });
  console.log('加载项目:', projectId);
};
</script>

<style scoped>
.info-editor-back{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.info-editor{
  min-height: 600px;
  min-width: 480px;
  background-color: #0e0e0e;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* 编辑器头部 */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e5;
  background-color: #0e0e0e;

}

.editor-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f0f0f0;
  color: #333333;
}

/* 表单样式 */
.info-editor form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333333;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #000000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
}

.form-input.disabled {
  background-color: #f5f5f5;
  color: #999999;
  cursor: not-allowed;
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: #000000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
}

/* 头像上传 */
.avatar-upload {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.avatar-preview {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e0e0e0;
  cursor: pointer;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-input {
  display: none;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: white;
}

.avatar-preview:hover .upload-overlay {
  opacity: 1;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.upload-text {
  font-size: 12px;
}

/* 错误信息 */
.error-message {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #ff4d4f;
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #e5e5e5;
}

.btn {
  padding: 10px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background-color: #ffffff;
  color: #333333;
}

.btn-secondary:hover {
  background-color: #f5f5f5;
  border-color: #d0d0d0;
}

.btn-primary {
  background-color: #000000;
  color: #ffffff;
  border-color: #000000;
}

.btn-primary:hover:not(:disabled) {
  background-color: #333333;
  border-color: #333333;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 修改资料按钮 */
.edit-btn,.logout-btn{
  padding: 8px 16px;
  background-color: #ffffff;
  color: #333333;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn:hover,.logout-btn:hover{
  background-color: #f5f5f5;
  border-color: #d0d0d0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-editor {
    min-width: 90vw;
    min-height: auto;
    max-height: 90vh;
    overflow-y: auto;
  }

  .editor-header {
    padding: 16px 20px;
  }

  .info-editor form {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}

.User {
  min-height: 100vh;
  max-height: 100vh;

  min-width: 100vw;
  display: flex;
  background-color: #f5f5f5;
  background-color: #0e0e0e;

}

.right {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
  max-height: 100vh;

}

/* 用户信息卡片 */
.user-profile {
  background-color: white;

  background-color: #0e0e0e;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  border: 0.1px solid #575757;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 30px;
}

.avatar-container {
  flex-shrink: 0;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid #e0e0e0;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 24px;
  font-weight: 700;
  color: #eeeeee;
  margin: 0 0 10px 0;
}

.bio {
  font-size: 16px;
  color: #9e9e9e;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #eeeeee;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

/* 作品展示 */
.user-works {
  background-color: white;
  background-color: #0e0e0e;

  border-radius: 12px;
  padding: 30px;
  border: 0.1px solid #575757;
  max-height: 100%;
  overflow: auto;
}

.works-title {
  font-size: 20px;
  font-weight: 600;
  color: #eeeeee;
  margin: 0 0 20px 0;
}

.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.work-item {
  background-color: #0e0e0e;
  border: 0.1px solid rgb(224, 224, 224,0.3);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.work-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.work-thumbnail {
  position: relative;
  height: 150px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #313131 0%, #474747 100%);
  opacity: 0.8;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.9);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-button:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.work-info {
  padding: 15px;
}

.work-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.work-meta {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .stats {
    justify-content: center;
  }

  .works-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>
