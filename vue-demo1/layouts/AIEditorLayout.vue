<template>
  <div class="AI-editor-layout">
    <Aside></Aside>
    <div class="AI-editor">

      <div class="ai-editor-bg" aria-hidden="true">
        <div class="ai-editor-bg-base"></div>
        <div class="ai-editor-waves">
          <svg
            class="waves-svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2400 140"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="ai-waves-fade"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12" />
                <stop offset="45%" stop-color="#ffffff" stop-opacity="0.04" />
                <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
              </linearGradient>
            </defs>
            <g class="wave-layer wave-layer--1">
              <g class="wave-drift">
                <path
                  class="wave-path wave-path--back"
                  fill="none"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                  d="M0,88 C200,72 400,104 600,88 S1000,72 1200,88 S1600,104 1800,88 S2200,72 2400,88"
                />
                <path
                  class="wave-path wave-path--back"
                  fill="none"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                  transform="translate(2400 0)"
                  d="M0,88 C200,72 400,104 600,88 S1000,72 1200,88 S1600,104 1800,88 S2200,72 2400,88"
                />
              </g>
            </g>
            <g class="wave-layer wave-layer--2">
              <g class="wave-drift">
                <path
                  class="wave-path wave-path--mid-far"
                  fill="none"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                  d="M0,98 C220,118 440,78 660,98 S1100,118 1320,98 S1760,78 1980,98 S2200,118 2400,98"
                />
                <path
                  class="wave-path wave-path--mid-far"
                  fill="none"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                  transform="translate(2400 0)"
                  d="M0,98 C220,118 440,78 660,98 S1100,118 1320,98 S1760,78 1980,98 S2200,118 2400,98"
                />
              </g>
            </g>
            <g class="wave-layer wave-layer--3">
              <g class="wave-drift">
                <path
                  class="wave-path wave-path--mid"
                  fill="none"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                  d="M0,72 C180,52 360,92 540,72 S900,52 1080,72 S1440,92 1620,72 S1980,52 2160,72 S2280,88 2400,72"
                />
                <path
                  class="wave-path wave-path--mid"
                  fill="none"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                  transform="translate(2400 0)"
                  d="M0,72 C180,52 360,92 540,72 S900,52 1080,72 S1440,92 1620,72 S1980,52 2160,72 S2280,88 2400,72"
                />
              </g>
            </g>
            <g class="wave-layer wave-layer--4">
              <g class="wave-drift">
                <path
                  class="wave-path wave-path--front-soft"
                  fill="none"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                  d="M0,108 C240,92 480,124 720,108 S1200,92 1440,108 S1920,124 2160,108 S2280,100 2400,108"
                />
                <path
                  class="wave-path wave-path--front-soft"
                  fill="none"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                  transform="translate(2400 0)"
                  d="M0,108 C240,92 480,124 720,108 S1200,92 1440,108 S1920,124 2160,108 S2280,100 2400,108"
                />
              </g>
            </g>
            <g class="wave-layer wave-layer--5">
              <g class="wave-drift">
                <path
                  class="wave-path wave-path--front"
                  fill="none"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                  d="M0,62 C160,42 320,82 480,62 S800,42 960,62 S1280,82 1440,62 S1760,42 1920,62 S2160,82 2400,62"
                />
                <path
                  class="wave-path wave-path--front"
                  fill="none"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                  transform="translate(2400 0)"
                  d="M0,62 C160,42 320,82 480,62 S800,42 960,62 S1280,82 1440,62 S1760,42 1920,62 S2160,82 2400,62"
                />
              </g>
            </g>
            <g class="wave-layer wave-layer--6">
              <g class="wave-drift">
                <path
                  class="wave-path wave-path--accent-a"
                  fill="none"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                  d="M0,52 C200,68 400,36 600,52 S1000,68 1200,52 S1600,36 1800,52 S2200,68 2400,52"
                />
                <path
                  class="wave-path wave-path--accent-a"
                  fill="none"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                  transform="translate(2400 0)"
                  d="M0,52 C200,68 400,36 600,52 S1000,68 1200,52 S1600,36 1800,52 S2200,68 2400,52"
                />
              </g>
            </g>
            <g class="wave-layer wave-layer--7">
              <g class="wave-drift">
                <path
                  class="wave-path wave-path--accent-b"
                  fill="none"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                  d="M0,118 C260,98 520,138 780,118 S1300,98 1560,118 S1820,138 2080,118 S2240,108 2400,118"
                />
                <path
                  class="wave-path wave-path--accent-b"
                  fill="none"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                  transform="translate(2400 0)"
                  d="M0,118 C260,98 520,138 780,118 S1300,98 1560,118 S1820,138 2080,118 S2240,108 2400,118"
                />
              </g>
            </g>
            <rect
              class="waves-vignette"
              x="0"
              y="0"
              width="2400"
              height="140"
              fill="url(#ai-waves-fade)"
              pointer-events="none"
            />
          </svg>
        </div>
      </div>


      <div class="ai-content">
        <div class="ai-header">
          <h2> AI 音乐生成</h2>
          <p class="ai-subtitle">输入曲风描述，AI 将为你生成专业的音乐</p>
        </div>

        <div class="input-section">
          <label class="input-label">曲风描述</label>
          <textarea
            v-model="styleDescription"
            class="style-input"
            placeholder="例如：轻快的电子音乐，适合科技视频。忧伤的钢琴曲，缓慢。欢快的流行音乐，适合派对"
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
            <span v-else> 生成音乐</span>
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
  min-height: 0;
  background-color: #121212;
  color: #CCD0CF;
}

.AI-editor {
  position: relative;
  display: inline-block;
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  min-width: 0;
  min-height: 0;
}

.ai-editor-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.ai-editor-bg-base {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    /* #9c9c9c 0%, */
    /* #000000 50%, */
    #0e0e0e 100%
  );
}

.ai-editor-waves {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 33.333%;
  overflow: hidden;
  opacity: 0.95;
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.35) 22%,
    #000 52%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.35) 22%,
    #000 52%
  );
}

.waves-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.wave-drift {
  will-change: transform;
}

@keyframes wave-drift-x {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-2400px);
  }
}

/* 各层时长略有差异，部分反向，形成纵深流动 */
.wave-layer--1 .wave-drift {
  animation: wave-drift-x 58s linear infinite;
}

.wave-layer--2 .wave-drift {
  animation: wave-drift-x 51s linear infinite reverse;
}

.wave-layer--3 .wave-drift {
  animation: wave-drift-x 46s linear infinite;
}

.wave-layer--4 .wave-drift {
  animation: wave-drift-x 54s linear infinite reverse;
}

.wave-layer--5 .wave-drift {
  animation: wave-drift-x 42s linear infinite;
}

.wave-layer--6 .wave-drift {
  animation: wave-drift-x 49s linear infinite reverse;
}

.wave-layer--7 .wave-drift {
  animation: wave-drift-x 56s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .wave-layer--1 .wave-drift,
  .wave-layer--2 .wave-drift,
  .wave-layer--3 .wave-drift,
  .wave-layer--4 .wave-drift,
  .wave-layer--5 .wave-drift,
  .wave-layer--6 .wave-drift,
  .wave-layer--7 .wave-drift {
    animation: none;
  }
}

/* 分层明度：远层更暗，近层略亮，保持冷静 monochrome */
.wave-path--back {
  stroke: rgba(255, 255, 255, 0.096);
  stroke-width: 1;
}

.wave-path--mid-far {
  stroke: rgba(210, 212, 218, 0.158);
  stroke-width: 1;
}

.wave-path--mid {
  stroke: rgba(255, 255, 255, 0.192);
  stroke-width: 1.15;
}

.wave-path--front-soft {
  stroke: rgba(185, 188, 196, 0.329);
  stroke-width: 1;
}

.wave-path--front {
  stroke: rgba(255, 255, 255, 0.473);
  stroke-width: 1.1;
}

.wave-path--accent-a {
  stroke: rgba(230, 232, 238, 0.329);
  stroke-width: 0.9;
}

.wave-path--accent-b {
  stroke: rgba(255, 255, 255, 0.116);
  stroke-width: 0.85;
}

.waves-vignette {
  mix-blend-mode: soft-light;
}

.ai-content {
  position: relative;
  z-index: 1;
  max-width: 1600px;
  margin: 0 auto;
}


.ai-header {
  text-align: center;
  margin-top: 50px;
  margin-bottom: 40px;
}

.ai-header h2 {
  font-size: 42px;
  margin-bottom: 18px;
  color: #ffffff;
}

.ai-subtitle {
  font-size: 20px;
  color: #cfcfcf88;
  margin: 0;
}

.input-section {
  margin-top: 100px;
  margin-bottom: 30px;
}

.input-label {
  display: block;
  font-size: 26px;
  font-weight: 500;
  margin-bottom: 25px;
  color: #CCD0CF;
}

.style-input {
  width: 100%;
  padding: 16px;
  height: 120px;
  border: 1px solid #5f5f5f;
  border-radius: 8px;
  background-color: #0e0e0e;
  box-shadow: 0 0 15px 3px  rgba(255, 255, 255, 0.35) ;
  color: #CCD0CF;
  font-size: 22px;
  font-family: inherit;
  resize: vertical;
  /* transition: all 0.3s; */
}

.style-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
}

.style-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-hint {
  font-size: 18px;
  color: #CCD0CF;
  margin-top: 20px;
  margin-bottom: 0;
}

.button-section {
  margin-top: 80px;
  margin-bottom: 20px;
  text-align: center;
}

.generate-button {
  background: #252525;
  border: 1px solid #5f5f5f;
  color: white;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
}

.generate-button:hover:not(:disabled) {
  background: #ccc;
  color: #000000;
  transform: translateY(-2px);
}

.generate-button:disabled {
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
