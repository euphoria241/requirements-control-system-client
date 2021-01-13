<template>
  <v-card outlined>
    <v-list-item three-line>
      <v-list-item-content>
        <v-list-item-title class="headline mb-1">
          {{ project.title }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ project.description }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-card>
</template>

<script>
export default {
  props: {
    project: Object,
  },
};
</script>

<style></style>
