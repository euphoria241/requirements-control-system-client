<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        Список требований
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="dialog = true">
          <v-icon left dark>mdi-plus</v-icon>
          Создать требование
        </v-btn>
        <!-- <v-switch v-model="switch1" inset :label="`Switch 1: ${switch1.toString()}`"></v-switch> -->
      </v-card-title>
      <!-- <v-btn tile dark color="primary" @click="dialog = true">
      <v-icon left dark> mdi-plus </v-icon>
      Создать требование
    </v-btn>
    <v-text-field
      v-model="search"
      append-icon="mdi-magnify"
      label="Search"
      single-line
      hide-details
    >
    </v-text-field> -->
      <v-data-table
        :headers="headers"
        :items="requirements"
        :search="search"
        @click="tableRowCick(item)"
      >
        <template v-slot:item="{ item }">
          <tr @click="rowClicked(item)">
            <td>{{ item.name }}</td>
            <td>{{ item.description.slice(0, 80) }}...</td>
            <td>{{ item.author }}</td>
            <td>{{ item.type }}</td>
            <td>{{ item.priority }}</td>
            <td>{{ item.status }}</td>
            <td>
              <v-icon small class="mr-2" @click.stop="editRequirement(item)">
                mdi-pencil
              </v-icon>
              <!-- <v-icon small @click.stop="deleteRequirement(item)">
                mdi-delete
              </v-icon> -->
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editableItem.name"
                  color="info"
                  label="Название"
                  :rules="fieldRules"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea color="info" v-model="editableItem.description">
                  <template v-slot:label>
                    <div>Описание <small>(опционально)</small></div>
                  </template>
                </v-textarea>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  :rules="fieldRules"
                  v-model="editableItem.type"
                  :items="['Функциональное', 'Нефункциональное']"
                  label="Тип"
                  required
                  color="info"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  :rules="fieldRules"
                  v-model="editableItem.priority"
                  :items="['Высокий', 'Средний', 'Низкий']"
                  label="Приоритет"
                  required
                  color="info"
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="close">
            Close
          </v-btn>
          <v-btn color="blue darken-1" text @click="saveRequirement">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogDelete" max-width="610px" persistent>
      <v-card>
        <v-card-title class="headline">Вы уверены, что хотите удалить это требование?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDelete">Отмена</v-btn>
          <v-btn color="blue darken-1" text @click="confirmDelete">Подтвердить</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'Requirements',
  data() {
    return {
      dialog: false,
      dialogDelete: false,
      switch1: true,
      editableItem: {
        name: '',
        description: '',
        type: '',
        priority: '',
        project: this.$route.params.projId,
        author: this.$store.getters.user.id,
      },
      defaultItem: {
        name: '',
        description: '',
        type: '',
        priority: '',
        project: this.$route.params.projId,
        author: this.$store.getters.user.id,
      },
      editableID: -1,
      requirements: [],
      search: '',
      headers: [
        { text: 'Название', value: 'name' },
        { text: 'Описание', value: 'description' },
        { text: 'Автор', value: 'author' },
        { text: 'Тип', value: 'type' },
        { text: 'Приоритет', value: 'priority' },
        { text: 'Статус', value: 'status' },
        { text: 'Действия', value: 'actions', sortable: false },
      ],
      fieldRules: [v => !!v || 'Обязательное поле'],
    };
  },
  mounted() {
    this.$http({
      url: `http://localhost:3939/requirements?project=${this.$route.params.projId}`,
      method: 'GET',
    })
      .then(result => {
        let tempData = result.data.map(this.parseDate);
        this.requirements = tempData.map(req => {
          const tempUser = this.$store.getters.userList.find(user => user.id == req.author);
          return { ...req, author: tempUser.username };
        });
      })
      .catch(err => console.log(err));
  },
  computed: {
    formTitle() {
      return this.editableID === -1 ? 'Создать требование' : 'Изменить требование';
    },
  },
  methods: {
    rowClicked(req) {
      this.$router.push({ name: 'Требование', params: { reqID: req.id } });
    },
    parseDate(req) {
      let date = new Date(Date.parse(req.createdAt)).toUTCString();
      delete req.createdAt;
      return { ...req, createdAt: date };
    },
    async saveRequirement() {
      if (this.$refs.form.validate()) {
        try {
          if (this.editableID === -1) {
            const response = await this.$http({
              url: `http://localhost:3939/requirements`,
              data: this.editableItem,
              method: 'POST',
            });
            let req = response.data;
            req.createdAt = new Date(Date.parse(req.createdAt)).toUTCString();
            this.requirements.push({ ...req, author: this.$store.getters.user.username });
          } else {
            const response = await this.$http({
              url: `http://localhost:3939/requirements`,
              data: this.editableItem,
              method: 'PUT',
            });
            let req = await response.data;
            req.createdAt = new Date(Date.parse(req.createdAt)).toUTCString();
            const id = this.requirements.findIndex(x => x.id === req.id);
            Object.assign(this.requirements[id], req);
          }
        } catch (error) {
          console.log(error);
        } finally {
          this.close();
        }
      }
    },
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editableItem = Object.assign({}, this.defaultItem);
        this.editableID = -1;
        this.$refs.form.reset();
      });
    },
    editRequirement(requirement) {
      this.editableID = requirement.id;
      this.editableItem = Object.assign({}, requirement);
      this.dialog = true;
    },
    deleteRequirement(requirement) {
      this.editableID = requirement.id;
      this.editableItem = Object.assign({}, requirement);
      this.dialogDelete = true;
    },
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editableItem = Object.assign({}, this.defaultItem);
        this.editableID = -1;
      });
    },
    async confirmDelete() {
      try {
        const response = await this.$http({
          url: `http://localhost:3939/requirements`,
          data: { id: this.editableItem.id },
          method: 'DELETE',
        });
        if (response.status === 200) {
          this.requirements = this.requirements.filter(req => req.id != this.editableItem.id);
        } else if (response.status === 404) {
          throw new Error('Post not found');
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        this.closeDelete();
      }
    },
  },
};
</script>
