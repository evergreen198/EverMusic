import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { onMounted } from 'vue'

const app=createApp(App)
app.use(router)
app.mount('#app')
window.addEventListener(
  'wheel',
  (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault()
    }
  },
  { passive: false } // 必须
)
window.addEventListener('keydown', (e: KeyboardEvent) => {
  if (
    e.ctrlKey &&
    (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')
  ) {
    e.preventDefault()
  }
})
window.addEventListener(
  'gesturestart',
  (e) => e.preventDefault()
)


// window.addEventListener('resize', () => {
//     console.log('scale',window);
//     console.log('zoom',getZoom());

//     const z = getZoom();
//     if (z > MAX) {
//       // 把比例拉回来（只能整数百分比，所以先放大到 120%）
//       if (window.chrome || window.navigator.userAgent.includes('Firefox')) {
//         // Chrome/Edge 支持
//         document.body.style.zoom = `${MAX*100}%`;
//       } else {
//         // Firefox 没有 zoom，用 transform 顶一下
//         document.documentElement.style.transform = `scale(${MAX})`;
//         document.documentElement.style.transformOrigin = '0 0';
//       }
//     }
//     else if(z<MIN){
//         if (window.chrome || window.navigator.userAgent.includes('Firefox')) {
//             // Chrome/Edge 支持
//             document.body.style.zoom = `${MIN*100}%`;
//           } else {
//             // Firefox 没有 zoom，用 transform 顶一下
//             document.documentElement.style.transform = `scale(${MIN})`;
//             document.documentElement.style.transformOrigin = '0 0';
//           }
//     }
//   });
