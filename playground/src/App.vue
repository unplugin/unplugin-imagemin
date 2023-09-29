<script setup lang="ts"></script>

<template>
  <div>
    <img
      style="width: 1200px"
      src="./assets/image/wallhaven-x61xdo.jpg"
      alt=""
    />
    <!-- <div class="a"></div> -->
    <div class="b"></div>
    <!-- <img src="./assets/shuimo.svg" alt="" /> -->
    <img src="/img/a.png" alt="" />
    <img src="/img/b.png" alt="" />
    <img src="/img/c.png" alt="" />
    <img src="/img/d.png" alt="" />
    <!-- <router-link to="/home">Go to Home</router-link>
    <router-link to="/about">Go to About</router-link>
    <RouterView /> -->
    <!-- <img src="./assets/vuetify.svg" alt="" /> -->
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
  background-image: url('/a.png');
  background-position: center center;
}
.b {
  background-image: url('/b.png');
  width: 500px;
  height: 400px;
  background-position: center center;
} */
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
