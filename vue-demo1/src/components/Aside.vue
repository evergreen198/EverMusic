<template>
    <div class="Aside">
        <aside ref="aside" class="left">
          <div class="icon-img">1
              <img src="" alt="">
           </div>
           <ul>
            <li><a href="">云音乐</a></li>
            <li><router-link to="/">开始创作</router-link></li>
            <li><router-link to="/Library">和弦图书馆</router-link></li>
            <li><router-link to="/User">我的创作</router-link></li>
            <li><a href="">AI</a></li>
        </ul>
        <button ref="asideBtn" class="aside-btn close">,</button>
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
    aside.value.style.marginLeft = '-280px'
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
    aside.value.style.marginLeft = '-280px'
    aside.value.className = 'aside open'
    isSidebarOpen.value = false
  }

  console.log('asideloaded');
  emit('loaded', true)

  // 等待过渡结束后移除过渡效果
  const handleTransitionEnd = () => {
    aside.value?.removeEventListener('transitionend', handleTransitionEnd)
    // 过渡结束后设置transition为none
    aside.value.style.transition = 'none'
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
  min-width: 260px;
  max-width: 260px;
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;
  margin-left:0px ;
  background-color:#11212D;
  position: relative;
  transform: scale(1);
  transform-origin: top left;
  z-index: 1000;
  transition: none; /* 默认不设置过渡效果，由JavaScript控制 */
}
.icon-img{
    height: 250px;
}
aside a{
    display: inline-block;
    position: relative;
    color: aliceblue;
    font-weight: 250;
    font-size: 28px;
    margin: 15px 0 5px 25px;

}
.aside-btn{
    position: relative;
    top:0;
    left:225px;
    cursor: pointer;
    height: 60px;
    width: 60px;
    border: none;
    border-radius: 99%;
    z-index: 1000; /* 确保在最上层 */
    background-color: #9fb2c1; /* 确保可见性 */
}

aside ul li:hover{
    background-color:#253745;
    cursor: pointer;
}</style>
