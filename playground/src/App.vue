<script setup lang="ts"></script>

<template>
  <div>
    <div class="a"></div>
    <div class="b"></div>
    <img src="./assets/shuimo.svg" alt="" />
    <!-- <img src="/a.png" alt="" />
    <img src="/b.png" alt="" />
    <img src="/c.png" alt="" />
    <img src="/d.png" alt="" /> -->
    <!-- <router-link to="/home">Go to Home</router-link>
    <router-link to="/about">Go to About</router-link>
    <RouterView /> -->
    <!-- <img src="./assets/image/wallhaven-zyxvqy.jpeg" alt="" /> -->
    <!-- <img src="./assets/vuetify.svg" alt="" /> -->
  </div>
</template>

<!-- <style> -->
<style lang="scss">
div {
  display: flex;
  flex-wrap: wrap;
}

.a {
  width: 500px;
  height: 400px;
  background-image: url('/a.png');
  background-position: center center;
}
.b {
  background-image: url('/a.png');
  width: 500px;
  height: 400px;
  background-image: url('/a.png');
  background-position: center center;
}
body {
  width: 100%;
  height: 100%;
  /* background: url("./assets/image/wallhaven-l8z9jr.jpeg"); */
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
