<script setup lang="ts">
import Img from './assets/image/wallhaven-2ykjxm.png'
const demo = new URL('./assets/image/wallhaven-2ykjxm.png', import.meta.url).href
</script>

<template>
  <div>
    <img style="width: 1200px" src="./assets/image/wallhaven-kxy326.png" alt="" />
    <img style="width: 1200px" src="./assets/image/wallhaven-x61xdo.jpg" alt="" />
    <img :src="demo" alt="">
      <img :src="Img" alt="">
        <!-- <router-link to="/home">Go to Home</router-link>
        <router-link to="/about">Go to About</router-link>
        <RouterView /> -->
  </div>
</template>

<!-- <style> -->
<style lang="scss">
div {
  display: flex;
  flex-wrap: wrap;
}

/* .a {
  width: 500px;
  height: 400px;
  background-image: url('./assets/image/wallhaven-x61xdo.jpg');
  background-position: center center;
} */

.b {
  // background-image: url('/img/b.png');
  width: 500px;
  height: 400px;
  background-position: center center;
}

body {
  width: 100%;
  height: 100%;
  // background: url('./assets/image/wallhaven-l8z9jr.jpeg');
  background-size: cover;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
