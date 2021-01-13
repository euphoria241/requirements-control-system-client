<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        Список спецификаций
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Поиск"
          single-line
          hide-details
        ></v-text-field>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="pushToCreatePage">
          <v-icon left dark>mdi-plus</v-icon>
          Создать спецификацию
        </v-btn>
      </v-card-title>
      <v-data-table :headers="headers" :items="specifications" :search="search">
        <template v-slot:item="{ item }">
          <tr @click="rowClicked(item)">
            <td>{{ item.title }}</td>
            <!-- <td :class="{ nodescription: !item.description }">
              {{ item.description ? item.description : 'Отсутствует' }}
            </td> -->
            <td>{{ item.author }}</td>
            <td>{{ new Date(Date.parse(item.createdAt)).toUTCString() }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'SpecificationList',
  data() {
    return {
      specifications: [],
      search: '',
      headers: [
        { text: 'Название', value: 'title' },
        // { text: 'Описание', value: 'description' },
        { text: 'Автор', value: 'author' },
        { text: 'Дата создания', value: 'createdAt' },
      ],
    };
  },
  async mounted() {
    try {
      const response = await this.$http({
        url: `http://localhost:3939/specifications?project=${this.$route.params.projId}`,
        method: 'GET',
      });
      let tempData = response.data;
      this.specifications = tempData.map(spec => {
        const tempUser = this.$store.getters.userList.find(user => user.id == spec.author);
        return { ...spec, author: tempUser.username };
      });
    } catch (error) {
      console.log(error);
    }
  },
  computed: {},
  methods: {
    rowClicked(spec) {
      this.$router.push({ name: 'Спецификация', params: { specId: spec.id } });
    },
    pushToCreatePage() {
      this.$router.push({ name: 'Создание спецификации' });
    },
  },
};
</script>

<style>
.nodescription {
  color: rgb(150, 148, 148);
}
</style>
