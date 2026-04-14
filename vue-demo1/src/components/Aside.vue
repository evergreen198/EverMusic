<template>
    <div class="Aside">
        <aside ref="aside" class="left">
          <div class="icon-img">1
              <img src="" alt="">
           </div>
           <ul>
            <li><router-link to="/">开始创作</router-link></li>
            <li><router-link to="/User">我的创作</router-link></li>
            <li><router-link to="/AI">AI作曲</router-link></li>
        </ul>
        <button
          ref="asideBtn"
          class="aside-btn close"
          :aria-label="isSidebarOpen ? '收起侧边栏' : '展开侧边栏'"
        >
          <span class="chevron" :class="isSidebarOpen ? 'left' : 'right'" aria-hidden="true"></span>
        </button>
      </aside>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
const emit=defineEmits(['loaded'])

const aside = ref<HTMLElement | null>(null)
const asideBtn = ref<HTMLElement | null>(null)

const isSidebarOpen = ref(true)
const isMobile = ref(false)
//缩放侧边栏
 async function toggleSidebar(){
  if (!aside.value || !asideBtn.value) return // 空值检查

  // 设置过渡效果
  aside.value.style.transition = 'all 0.4s ease'

  isSidebarOpen.value = !isSidebarOpen.value
  if (isSidebarOpen.value) {
    aside.value.style.marginLeft = '0px'
    asideBtn.value.classList.replace('open', 'close')
  } else {
    aside.value.style.marginLeft = '-260px'
    asideBtn.value.classList.replace('close', 'open')
  }

  // 等待过渡结束后移除过渡效果
  await new Promise((resolve) => {
    const handleTransitionEnd = () => {
      if(aside.value){
        aside.value?.removeEventListener('transitionend', handleTransitionEnd)
      // 过渡结束后设置transition为none
      aside.value.style.transition = 'none'
      resolve(undefined)}
    }
    aside.value?.addEventListener('transitionend', handleTransitionEnd, { once: true })
  })
}
//自适应检查视口大小
function handleMediaQueryChange(mediaQuery: MediaQueryList | MediaQueryListEvent): void {
  if (!aside.value) return // 空值检查
  isMobile.value = !mediaQuery.matches

  // 设置过渡效果
  aside.value.style.transition = 'all 0.4s ease'

  if (mediaQuery.matches) {
    aside.value.style.marginLeft = '0px'
    aside.value.className = 'aside close'
    isSidebarOpen.value = true
  } else {
    aside.value.style.marginLeft = '-260px'
    aside.value.className = 'aside open'
    isSidebarOpen.value = false
  }

  console.log('asideloaded');
  emit('loaded', true)

  // 等待过渡结束后移除过渡效果
  const handleTransitionEnd = () => {
    aside.value?.removeEventListener('transitionend', handleTransitionEnd)
    // 过渡结束后设置transition为none
    aside.value!.style.transition = 'none'
  }
  aside.value?.addEventListener('transitionend', handleTransitionEnd, { once: true })
}

let mediaQuery: MediaQueryList | null = null

onMounted(() => {
  mediaQuery = window.matchMedia('(min-width:600px)')
  handleMediaQueryChange(mediaQuery)
  if (asideBtn.value) {
    asideBtn.value.addEventListener('click', toggleSidebar)
  }
  if (mediaQuery) {
    mediaQuery.addEventListener('change', handleMediaQueryChange)
  }
})

onUnmounted(() => {
  if (asideBtn.value) {
    asideBtn.value.removeEventListener('click', toggleSidebar)
  }
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', handleMediaQueryChange)
  }
})
</script>

<style scoped>

aside{
  display: inline-block flex;
  width: 260px;
  min-width: 0px;
  max-width: 260px;
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;
  margin-left:0px ;
  background-color:#0e0e0e;
  border-right: solid #ccc 1.5px ;
  position: relative;
  transform: scale(1);
  transform-origin: top left;
  z-index: 1000;
  transition: none;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}
.icon-img{
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid rgba(255,255,255,0.05);
}
aside ul{
    list-style: none;
    padding: 0;
    margin: 0;
}
aside ul li{
    padding: 0;
    margin: 0;
}
aside a{
    display: block;
    position: relative;
    color: #909091;
    font-weight:3400;
    font-size: 28px;
    margin: 15px 0 5px 25px;
    text-decoration: none;
    transition: all 0.3s ease;
    padding: 12px 25px;
    margin: 5px 0;
}

aside a:hover{
    color: #e2e8f0;
    background-color: rgba(255,255,255,0.05);
}

aside a.router-link-active{
    color: #e2e8f0;
    background-color: rgba(255,255,255,0.08);
    border-left: 3px solid #64748b;
}

.aside-btn{
    position: relative;
    top:0;
    left:230px;
    cursor: pointer;
    height: 60px;
    width: 60px;
    border: none;
    border-radius: 50%;
    z-index: 1000;
    background-color: rgba(255,255,255,0.1);
    color: #e2e8f0;
    font-size: 24px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.aside-btn:hover{
    background-color: rgba(255,255,255,0.15);
    transform: scale(1.05);
}

.aside-btn:active{
    transform: scale(0.95);
}

.chevron{
    position: absolute;
    top: 50%;
    left: 50%;
    width: 12px;
    height: 12px;
    border-right: 2.5px solid currentColor;
    border-bottom: 2.5px solid currentColor;
    transition: transform 0.25s ease;
    transform: translate(-50%, -50%);
}

.chevron.left{
    transform: translate(-50%, -50%) rotate(135deg);
}

.chevron.right{
    transform: translate(-50%, -50%) rotate(-45deg);
}

aside ul li:hover{
    background-color: transparent;
    cursor: pointer;
}</style>
