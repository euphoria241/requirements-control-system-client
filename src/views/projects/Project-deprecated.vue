<template>
  <v-container fluid>
    <router-link v-for="item in items" :key="item.to" :to="item.to" append>
      <h2>{{ item.title }}</h2>
    </router-link>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { title: 'Требования', to: 'requirements/' },
        { title: 'Спецификации', to: 'specifications/' },
      ],
    };
  },
};
</script>

<style></style>
