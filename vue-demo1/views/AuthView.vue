<!-- src/views/AuthView.vue -->
<template>
  <div class="auth-container">
    <div class="auth-box">
      <!-- Logo -->
      <div class="brand">
        <div class="logo">🎵</div>
        <h1>EverMusic</h1>
      </div>

      <!-- 切换标签 -->
      <div class="tabs">
        <button :class="['tab', { active: isLogin }]" @click="isLogin = true">登录</button>
        <button :class="['tab', { active: !isLogin }]" @click="isLogin = false">注册</button>
        <div class="tab-line" :style="{ left: isLogin ? '0' : '50%' }"></div>
      </div>

      <!-- 登录表单 -->
      <form v-if="isLogin" class="form" @submit.prevent="handleLogin">
        <div class="input-group">
          <input v-model="loginForm.email" type="text" placeholder="邮箱或用户名" required/>
        </div>
        <div class="input-group">
          <input v-model="loginForm.password" type="password" placeholder="密码" required/>
        </div>
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <p class="error" v-if="error">{{ error }}</p>
      </form>

      <!-- 注册表单 -->
      <form v-else class="form" @submit.prevent="handleRegister">
        <div class="input-group">
          <input v-model="registerForm.username" type="text" placeholder="用户名" required/>
        </div>
        <div class="input-group">
          <input v-model="registerForm.email" type="email" placeholder="邮箱" required/>
        </div>
        <div class="input-group">
          <input v-model="registerForm.password" type="password" placeholder="密码（至少6位）" minlength="6" required/>
        </div>
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
        <p class="error" v-if="error">{{ error }}</p>
      </form>

      <!-- 提示 -->
      <p class="tip">
        {{ isLogin ? '还没有账号？' : '已有账号？' }}
        <a href="#" @click.prevent="isLogin = !isLogin">
          {{ isLogin ? '立即注册' : '立即登录' }}
        </a>
      </p>
    </div>
  </div>
  <div class="waves-container">
    
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, register } from '../src/utils/api.js'

const router = useRouter()

const isLogin = ref(true)
const loading = ref(false)
const error = ref('')

const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  email: '',
  password: ''
})
//登录
const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    // 发送登录请求，支持用户名或邮箱登录
    const data = {
      email: loginForm.email, // 可以是邮箱或用户名
      password: loginForm.password // 使用password字段
    }
    const response = await login(data)

    // 登录成功，存储用户信息和token
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify(response))
    router.push('/')
  } catch (err) {
    // 处理错误
    if (err.response) {
      // 服务器返回错误
      error.value = err.response.data.error || '登录失败'
    } else {
      // 网络错误等
      error.value = '登录失败，请检查网络连接'
    }
  } finally {
    loading.value = false
  }
}
//注册
const handleRegister = async () => {
  loading.value = true
  error.value = ''

  try {
    // 发送注册请求
    const data = {
      username: registerForm.username,
      email: registerForm.email,
      password_hash: registerForm.password
    }
    const response = await register(data)

    // 注册成功，存储用户信息和token
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify(response))
    router.push('/')
  } catch (err) {
    // 处理错误
    if (err.response) {
      // 服务器返回错误
      error.value = err.response.data.error || '注册失败'
    } else {
      // 网络错误等
      error.value = '注册失败，请检查网络连接'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 20px;
}

.auth-box {
  background: #1e1e2f;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
}

.brand {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3a3a5a 0%, #2d3748 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  margin: 0 auto 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.brand h1 {
  font-size: 24px;
  color: #e2e8f0;
  font-weight: 700;
}

.tabs {
  display: flex;
  position: relative;
  margin-bottom: 30px;
  border-bottom: 2px solid rgba(255,255,255,0.1);
}

.tab {
  flex: 1;
  padding: 15px;
  border: none;
  background: none;
  font-size: 16px;
  font-weight: 600;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.3s;
}

.tab.active {
  color: #94a3b8;
}

.tab-line {
  position: absolute;
  bottom: -2px;
  width: 50%;
  height: 2px;
  background: #64748b;
  transition: left 0.3s;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  font-size: 15px;
  background: rgba(255,255,255,0.05);
  color: #e2e8f0;
  transition: all 0.3s;
}

.input-group input::placeholder {
  color: #64748b;
}

.input-group input:focus {
  outline: none;
  border-color: #64748b;
  background: rgba(255,255,255,0.08);
}

.submit-btn {
  padding: 14px;
  background: linear-gradient(135deg, #3a3a5a 0%, #2d3748 100%);
  color: #e2e8f0;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.4);
  background: linear-gradient(135deg, #4a4a6a 0%, #3d4758 100%);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  color: #f87171;
  font-size: 14px;
  text-align: center;
}

.tip {
  text-align: center;
  margin-top: 25px;
  color: #94a3b8;
  font-size: 14px;
}

.tip a {
  color: #94a3b8;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.tip a:hover {
  color: #e2e8f0;
}
</style>
