import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

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

