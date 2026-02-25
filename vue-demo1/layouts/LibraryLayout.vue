<template>
    <div class="Library">
      <Aside></Aside>
      <div class="right">
        <div class="sample">
        <h1>This is Library</h1>

        </div>
        <div class="chord-library">
            <div class="chord-roll">
                <ul></ul>
                <div class="chord-content"></div>
            </div>
        </div>
      </div>

    </div>

</template>

<script setup lang="ts">
import Aside from '../src/components/Aside.vue'

</script>

<style scoped>
.Library{
    display: flex;
    min-height: 100vh;
    min-width: 100vw;
}
.right{
    display: flex;
    flex:1;
}
.sample{
    flex: 1;
    background-color: aqua;
    min-height: 100vh;
}
.chord-library{
    min-height: 100vh;
    width: 400px;
}
.chord-roll{
    display: flex;
}
.chord-roll ul{
    width: 100px;
    height: 100vh;
    background-color: blue;
}
.chord-content{
    flex: 1;
    height: 100vh;
    background-color: green;
}
</style>