import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { onMounted } from 'vue'

const app=createApp(App)
app.use(router)
app.mount('#app')
// const MAX = 2.5;
// const MIN=0.8
// // 统一拿当前缩放
// onMounted(()=>{
//   document.body.style.transformOrigin='(0,0)'
//     document.body.style.transform ='scale(1.8)'
// })
// const getZoom = () => window.devicePixelRatio * (window.outerWidth / window.innerWidth);

// window.addEventListener('wheel', e => {

//   if (e.ctrlKey && getZoom() >= MAX && e.deltaY < 0) {
//     e.preventDefault();   // 禁止继续放大
//   }
//   if (e.ctrlKey && getZoom() <= MIN && e.deltaY > 0){
//     e.preventDefault();   // 禁止继续缩小
//   }
// }, { passive:false });

// window.addEventListener('keydown', e => {
//   if ((e.ctrlKey || e.metaKey) &&
//       (e.key==='+' || e.key==='=' || e.key==='Add') &&
//       getZoom() >= MAX) {
//     e.preventDefault();
//   }
//   if ((e.ctrlKey || e.metaKey) &&
//       (e.key==='-' || e.key==='=' || e.key==='Subtract') &&
//       getZoom() <= MIN) {
//     e.preventDefault();
//   }
// });
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
