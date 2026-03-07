<template>
  <div class="User">
    <Aside></Aside>
    <div class="right">
      <!-- 用户信息卡片 -->
      <div class="user-profile">
        <div class="profile-header">
          <div class="avatar-container">
            <img
              src="/img/pexels-ecaterina-susu-1790735746-29779303.jpg"
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
import Aside from '../src/components/Aside.vue'
import { ref, onMounted, onUnmounted,onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import {getProjectList } from '../src/utils/api.js';

const router = useRouter()


// 用户信息管理
const user = ref<any>({
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
const error = ref('')

// 从localStorage获取用户信息
const loadUserInfo = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      user.value = {
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
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const userId = currentUser?.id || null;

  if (!userId) {
    alert('请先登录');
    return;
  }

  try {
    const response = await getProjectList(userId);
    works.value=response
    console.log(works.value);

  } catch (error) {
    console.error('获取历史作品失败:', error);
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
.User {
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  background-color: #f5f5f5;
}

.right {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 用户信息卡片 */
.user-profile {
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
  border: 3px solid #667eea;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 10px 0;
}

.bio {
  font-size: 16px;
  color: #666;
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
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

/* 作品展示 */
.user-works {
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.works-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.work-item {
  background-color: #f9f9f9;
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
  background-color: #11212D;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  background-color: rgba(255, 255, 255, 0.9);
  color: #667eea;
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
