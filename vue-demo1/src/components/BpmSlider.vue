<!-- filepath: c:\Users\文\Desktop\前端\复健\vue-demo1\src\components\VolumeSlider.vue -->
<template>
    <div class="volume-slider">
      <p for="volume">bpm {{ Bpm }}</p>
      <input
        id="volume"
        type="range"
        min="0"
        max="200"
        v-model="Bpm"
        @input="updateVolume"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  
  // 定义音量状态
  const Bpm = ref(120);
  
  // 定义事件发射器
  const emit = defineEmits(["update:volume"]);
  
  // 更新音量并发射事件
  function updateVolume() {
    emit("update:volume", Bpm.value);
  }
  </script>
  
  <style scoped>
  .volume-slider {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  p{
    display: inline-table;
    width: 80px;
    margin-left: 15px;
  }

  input[type="range"] {
    width: 150px;
  }
  </style>