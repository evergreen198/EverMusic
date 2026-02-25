<template>
    <div class="User">
      <Aside></Aside>
      <div class="right">
        <h1>This is user</h1>
      </div>

    </div>

</template>

<script setup lang="ts">
import Aside from '../src/components/Aside.vue'

</script>

<style scoped>
.User{
    min-height: 100vh;
    min-width: 100vw;
    display: flex;
}
.right{
    flex:1;
}
</style>