<script setup lang="ts"></script>

<template>
  <div>
    <router-link to="/home">Go to Home</router-link>
    <router-link to="/about">Go to About</router-link>
    <RouterView />
    <img src="./assets/image/wallhaven-kx9rx7.png" alt="" />
  </div>
</template>

<!-- <style> -->
<style lang="scss">
div {
  display: flex;
  flex-wrap: wrap;
}

body {
  // background-image: url('./assets/image/wallhaven-zyxvqy.jpeg');
  width: 100%;
  height: 100%;
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
