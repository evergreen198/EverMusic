<template>
  <div class="AI-editor-layout">
    <Aside></Aside>
    <div class="AI-editor">
      <div class="ai-content">
        <div class="ai-header">
          <h2>🎵 AI 音乐生成</h2>
          <p class="ai-subtitle">输入曲风描述，AI 将为你生成专业的音乐</p>
        </div>

        <div class="input-section">
          <label class="input-label">曲风描述</label>
          <textarea
            v-model="styleDescription"
            class="style-input"
            placeholder="例如：轻快的电子音乐，适合科技视频\n忧伤的钢琴曲，缓慢\n欢快的流行音乐，适合派对"
            rows="4"
            :disabled="isLoading"
          ></textarea>
          <p class="input-hint">请详细描述你想要的音乐风格、情绪、节奏等</p>
        </div>

        <div class="button-section">
          <button
            class="generate-button"
            @click="handleGenerate"
            :disabled="!styleDescription.trim() || isLoading"
          >
            <span v-if="isLoading" class="loading-spinner">⟳</span>
            <span v-else>🎯 生成音乐</span>
          </button>
        </div>

        <div v-if="errorMessage" class="error-message">
          ⚠️ {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          ✅ {{ successMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.AI-editor-layout {
  display: flex;
  min-width: 100vw;
  max-width: 100vw;
  height: 100%;
  background-color: #121212;
  color: #CCD0CF;
}

.AI-editor {
  display: inline-block;
  flex: 1;
  padding: 40px;
  background-color: #4a5277;
  overflow-y: auto;
}

.ai-content {
  max-width: 800px;
  margin: 0 auto;
}

.ai-header {
  text-align: center;
  margin-bottom: 40px;
}

.ai-header h2 {
  font-size: 28px;
  margin-bottom: 12px;
  color: #4a9eff;
}

.ai-subtitle {
  font-size: 16px;
  color: #8b9bb4;
  margin: 0;
}

.input-section {
  margin-bottom: 30px;
}

.input-label {
  display: block;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #CCD0CF;
}

.style-input {
  width: 100%;
  padding: 16px;
  border: 2px solid #2a4a5c;
  border-radius: 8px;
  background-color: #1a2a3a;
  color: #CCD0CF;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s;
}

.style-input:focus {
  outline: none;
  border-color: #4a9eff;
  box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.1);
}

.style-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-hint {
  font-size: 12px;
  color: #8b9bb4;
  margin-top: 8px;
  margin-bottom: 0;
}

.button-section {
  margin-bottom: 20px;
  text-align: center;
}

.generate-button {
  background: linear-gradient(135deg, #4a9eff, #3a8eef);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.generate-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #3a8eef, #2a7edf);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3);
}

.generate-button:disabled {
  background: #2a4a5c;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-message {
  background-color: rgba(255, 87, 87, 0.1);
  border: 1px solid #ff5757;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 20px;
  color: #ff5757;
  font-size: 14px;
}

.success-message {
  background-color: rgba(76, 175, 80, 0.1);
  border: 1px solid #4caf50;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 20px;
  color: #4caf50;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .AI-editor {
    padding: 20px;
  }

  .ai-header h2 {
    font-size: 24px;
  }

  .generate-button {
    padding: 14px 28px;
    font-size: 14px;
  }
}
</style>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { generateMusic } from '../src/utils/api.js';
import Aside from '../src/components/Aside.vue';

// 路由
const router = useRouter();

// 状态管理
const styleDescription = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// 生成音乐
const handleGenerate = async () => {
  if (!styleDescription.value.trim()) {
    errorMessage.value = '请输入曲风描述';
    return;
  }

  // 重置状态
  errorMessage.value = '';
  successMessage.value = '';
  isLoading.value = true;

  try {
    const musicData = await generateMusic(styleDescription.value);

    if (musicData ) {
      // 存储到 sessionStorage 以便在 DefaultLayout 中读取
      sessionStorage.setItem('aiGeneratedMusic', musicData);
      // 跳转到 DefaultLayout
      router.push('/');
    } else {
      errorMessage.value = '生成的音乐数据格式错误';
    }
  } catch (error) {
    console.error('生成音乐失败:', error);
    errorMessage.value = '生成音乐失败，请重试';
  } finally {
    isLoading.value = false;
  }
};
</script>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'AIEditorLayout',
})
</script>
