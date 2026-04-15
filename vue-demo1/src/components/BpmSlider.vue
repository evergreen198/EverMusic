
<template>
    <div class="bpm-slider">
      <p for="bpm">bpm {{ Bpm }}</p>
      <input
        id="bpm"
        type="range"
        min="0"
        max="200"
        v-model="Bpm"
        @input="updateBpm"
      />
    </div>
  </template>

  <script setup lang="ts">
  import { ref, watch,onMounted } from "vue";
  import { collaborativeEventsBpmSlider, registerSocketListenersBpmSlider, unregisterSocketListenersBpmSlider } from "@/utils/socketEvents";

  const Bpm = ref(120);
  const isLocalOperation=ref(false)
  interface remoteBpmdata {
      type: 'bpm',
      bpm: number 
    }
  const props = defineProps({
    projectId: {
      type: Number,
      default: null
    },
    isMultiUser: {
      type: Boolean,
      default: false
    }
  })
  // 定义bpm状态

  const emit = defineEmits(["update:bpm"]);
  function updateBpm() {
    isLocalOperation.value = true;
    emit("update:bpm", Number(Bpm.value));
    if (props.isMultiUser && props.projectId) {
      collaborativeEventsBpmSlider.editBpm(props.projectId, Number(Bpm.value));
    }
  }


  onMounted(() => {
    // 监听BPM变化
    watch(Bpm, (newVal) => {
      // 只有本地操作才发送socket事件
      if (isLocalOperation.value && props.isMultiUser && props.projectId) {
        collaborativeEventsBpmSlider.editBpm(props.projectId, Number(newVal));
        isLocalOperation.value = false; // 重置标志位
      }
    });

    // 监听多用户状态
    watch(() => props.isMultiUser, (newVal) => {
      if (newVal) {
        registerSocketListenersBpmSlider({
          onBpmUpdated: (data:remoteBpmdata) => {
            isLocalOperation.value = false; // 标记为远程更新
            Bpm.value = data.bpm;
          }
        });
      } else {
        unregisterSocketListenersBpmSlider();
      }
    });
  })

  </script>

  <style scoped>
  .bpm-slider {
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
