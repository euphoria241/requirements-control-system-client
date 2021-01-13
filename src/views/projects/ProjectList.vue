<template>
  <v-container fluid>
    <!-- <ProjectCard
      v-for="project in projects"
      :key="project.id"
      :project="project"
      @click.native="routeTo(project.id)"
      class="project-card"
    /> -->
    <v-card>
      <v-card-title>
        Список проектов
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Поиск"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="projects"
        single-expand
        :search="search"
        :expanded.sync="expanded"
        item-key="title"
        show-expand
        @click:row="(item, slot) => slot.expand(!slot.isExpanded)"
      >
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length" class="d-flex flex-row align-center">
            <router-link
              v-for="link in links"
              :key="link.to"
              :to="`${item.id}/${link.to}`"
              append
              class="mr-5"
            >
              {{ link.title }}
            </router-link>
          </td>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
// import ProjectCard from '@/components/ProjectCard.vue';

export default {
  name: 'Home',
  components: {
    // ProjectCard,
  },
  data() {
    return {
      projects: [],
      search: '',
      expanded: [],
      headers: [
        { text: 'Проект', value: 'title' },
        { text: 'Описание', value: 'description' },
        { text: 'Дата создания', value: 'createdAt' },
        { text: '', value: 'data-table-expand' },
      ],
      links: [
        { title: 'Требования', to: 'requirements/' },
        { title: 'Спецификации', to: 'specifications/' },
      ],
    };
  },
  mounted() {
    this.$http({ url: 'http://localhost:3939/projects', method: 'GET' })
      .then(result => (this.projects = result.data))
      .catch(err => console.log(err));
  },
  methods: {
    routeTo(projectId) {
      this.$router.push(`/projects/${projectId}`);
    },
  },
};
</script>

<style>
.project-list {
  display: flex;
  flex-wrap: wrap;
}
.project-card {
  margin: 10px;
}
.projects__table {
  margin: 0 auto;
}
.text-left {
  font-size: 1.1rem !important;
}
</style>
