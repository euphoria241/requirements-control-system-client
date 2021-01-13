<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        Список шаблонов
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
          Создать новый шаблон
        </v-btn>
      </v-card-title>
      <v-data-table :headers="headers" :items="templates" :search="search" fixed-header>
        <template v-slot:item="{ item }">
          <tr @dblclick="rowClicked(item)">
            <td>{{ item.name }}</td>
            <td>
              <v-icon small @click="deleteTemplate(item)">
                mdi-delete
              </v-icon>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'TemplateList',
  data() {
    return {
      templates: [],
      search: '',
      headers: [
        { text: 'Название', value: 'name' },
        { text: 'Действия', value: 'actions', sortable: false },
      ],
    };
  },
  created() {
    this.$http({
      url: 'http://localhost:3939/templates',
      method: 'GET',
    })
      .then(result => {
        this.templates = result.data;
      })
      .catch(err => console.log(err));
  },
  methods: {
    pushToCreatePage() {
      this.$router.push({ name: 'Создание шаблона спецификации' });
    },
    rowClicked(row) {
      console.log(row);
    },
    async deleteTemplate(template) {
      try {
        const response = await this.$http({
          url: 'http://localhost:3939/templates',
          data: { id: template.id },
          method: 'DELETE',
        });
        if (response.status === 200) {
          this.templates = this.templates.filter(req => req.id != template.id);
        } else if (response.status === 404) {
          throw new Error('Post not found');
        }
      } catch (error) {
        console.log(error.message);
      }
    },
  },
};
</script>

<style></style>
