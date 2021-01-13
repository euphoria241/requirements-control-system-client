<template>
  <div class="app-main-layout">
    <Navbar />
    <v-main class="app-page">
      <v-container fluid>
        <v-container v-if="projectID" fluid>
          <v-btn class="mr-2 mb-2" @click="$router.go(-1)">
            <v-icon dark> mdi-arrow-left </v-icon>
          </v-btn>
          <h2 class="font-weight-regular d-inline-flex">Проект "{{ projectID.title }}"</h2>
        </v-container>
        <router-view />
      </v-container>
    </v-main>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar';
export default {
  components: {
    Navbar,
  },
  mounted() {
    if (this.$store.getters.isLoggedIn) {
      this.$http({ url: 'http://localhost:3939/projects', method: 'GET' })
        .then(result => (this.projects = result.data))
        .catch(err => console.log(err));
      this.$http({
        url: `http://localhost:3939/users`,
        method: 'GET',
      })
        .then(result => {
          this.$store.dispatch('setUserList', result.data);
        })
        .catch(err => console.log(err));
    }
  },
  computed: {
    projectID() {
      return this.$route.params.projId
        ? this.projects.find(project => project.id == this.$route.params.projId)
        : null;
    },
  },
  data() {
    return { projects: [] };
  },
};
</script>
<style></style>
