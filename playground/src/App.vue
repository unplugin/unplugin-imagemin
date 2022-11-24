<script setup lang="ts"></script>

<template>
  <div>
    <router-link to="/home">Go to Home</router-link>
    <router-link to="/about">Go to About</router-link>
    <img src="./assets/image/wallhaven-zyxvqy.jpeg" alt="" />
    <RouterView />
  </div>
</template>

<style scoped>
div {
  display: flex;
  flex-wrap: wrap;
}
img {
  width: 500px;
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
