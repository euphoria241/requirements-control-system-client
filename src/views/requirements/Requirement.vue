<template>
  <v-container fluid v-if="!loading">
    <v-row>
      <v-col cols="12" md="9">
        <h1>{{ req.name }}</h1>
      </v-col>
      <v-col cols="6" md="3" align-self="center"> </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="9">
        <h4>Описание:</h4>
        {{ req.description }}
      </v-col>
      <v-col cols="6" md="3">
        <div class="mb-2">
          <h4>Статус:</h4>
          <v-select :items="shownStatuses" solo v-model="currentStatus"></v-select>
        </div>
        <div class="mb-2">
          <h4>Тип:</h4>
          {{ req.type }}
        </div>
        <div class="mb-2">
          <h4>Приоритет:</h4>
          {{ req.priority }}
        </div>
        <div class="mb-2">
          <h4>Оценка требования:</h4>
          <v-progress-circular
            v-if="loadingEval"
            :size="35"
            color="primary"
            indeterminate
            class="mr-2"
          ></v-progress-circular>
          <v-icon v-else large :color="iconColor" class="mr-2">
            {{ evaluation ? 'mdi-check-bold' : 'mdi-close-thick' }}
          </v-icon>
          <v-btn @click="getEvaluation" :disabled="loadingEval">Запросить</v-btn>
        </div>
        <v-divider></v-divider>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="9">
        <h4 class="font-weight-medium">Связанные требования:</h4>
        <v-container fluid>
          <v-chip
            class="ma-1"
            v-for="req in req.related"
            :key="req.id"
            link
            close
            @click:close="closeClick(req.id)"
            @click="pushToRequirement(req.id)"
            >{{ req.name }}</v-chip
          >
          <v-chip class="ma-1" @click="addRelatedReq"
            ><v-icon left>mdi-plus</v-icon>Добавить</v-chip
          >
        </v-container>
      </v-col>
      <v-col cols="6" md="3">
        <div class="mb-2">
          <h4>Дата создания:</h4>
          {{ req.createdAt }}
        </div>
        <div class="mb-2">
          <h4>Последнее изменение:</h4>
          {{ req.updatedAt }}
        </div>
      </v-col>
    </v-row>
    <v-btn v-if="currentStatus != req.status" @click="updateStatus">Сохранить</v-btn>
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <span class="headline">Добавить зависимые требования</span>
        </v-card-title>
        <v-card-text>
          <v-progress-circular
            v-if="loadingReqsForDialog"
            :width="3"
            color="primary"
            indeterminate
          ></v-progress-circular>
          <v-container v-else>
            <v-autocomplete
              v-model="select"
              chips
              deletable-chips
              multiple
              :items="reqForSelect"
              item-text="name"
              item-value="id"
            ></v-autocomplete>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="close">
            Close
          </v-btn>
          <v-btn color="blue darken-1" text @click="saveRelatedReqs">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'RequirementPage',
  data() {
    return {
      req: null,
      loading: true,
      loadingEval: false,
      evaluation: null,
      currentStatus: null,
      statuses: [],
      dialog: false,
      select: [],
      loadingReqsForDialog: false,
      projectReqs: [],
    };
  },
  created() {
    this.$http({ url: 'http://localhost:3939/meta/statuses', method: 'GET' })
      .then(result => {
        this.statuses = result.data.statuses;
      })
      .catch(err => console.log(err));
    this.$http({
      url: `http://localhost:3939/requirements?reqid=${this.$route.params.reqID}`,
      method: 'GET',
    })
      .then(data => {
        if (data.status === 404) {
          this.$router.push({ name: 'NotFound' });
        }
        return data.data;
      })
      .then(result => {
        this.req = result;
        this.req.createdAt = new Date(Date.parse(this.req.createdAt)).toUTCString();
        this.req.updatedAt = new Date(Date.parse(this.req.updatedAt)).toUTCString();
        this.currentStatus = this.req.status;
        this.loading = false;
      })
      .catch(err => console.log(err));
    this.getEvaluation();
  },
  computed: {
    iconColor() {
      return this.evaluation ? 'green' : 'red';
    },
    shownStatuses() {
      if (this.evaluation) {
        return this.statuses;
      } else {
        return this.statuses.filter(status => status != 'Выполнено');
      }
    },
    reqForSelect() {
      return this.projectReqs.filter(req => {
        let tempReq = this.req.related.find(relatedReq => relatedReq.id == req.id);
        if (!tempReq && req.id != this.req.id) {
          return req;
        }
      });
    },
  },
  methods: {
    close() {
      this.dialog = false;
      this.select = [];
    },
    async saveRelatedReqs() {
      if (this.select.length > 0) {
        const response = await this.$http({
          url: 'http://localhost:3939/requirements/relations',
          data: { reqID: this.req.id, relatedReqs: this.select },
          method: 'POST',
        });
        let { newRelated } = response.data;
        this.req.related = newRelated;
        this.close();
      }
    },
    addRelatedReq() {
      this.dialog = true;
      this.loadingReqsForDialog = true;
      this.$http({
        url: `http://localhost:3939/requirements?project=${this.$route.params.projId}`,
        method: 'GET',
      })
        .then(result => {
          this.projectReqs = result.data;
          this.loadingReqsForDialog = false;
        })
        .catch(err => console.log(err));
    },
    async closeClick(id) {
      const response = await this.$http({
        url: 'http://localhost:3939/requirements/relations',
        data: { req1ID: this.req.id, req2ID: id },
        method: 'DELETE',
      });
      if (response.status === 200) {
        this.req.related = this.req.related.filter(req => req.id != id);
      } else if (response.status === 404) {
        throw new Error('Row not found');
      }
    },
    pushToRequirement(requirementID) {
      let routeData = this.$router.resolve({
        name: 'Требование',
        params: { reqID: requirementID },
      });
      window.open(routeData.href, '_blank');
    },
    getEvaluation() {
      this.loadingEval = true;
      this.$http({
        url: `http://localhost:3939/tests?requirementID=${this.$route.params.reqID}`,
        method: 'GET',
      })
        .then(result => {
          setTimeout(() => {
            this.evaluation = result.data.evaluation;
            if (!this.evaluation) {
              this.currentStatus = this.req.status;
            }
            this.loadingEval = false;
          }, 1000);
        })
        .catch(err => console.log(err));
    },
    async updateStatus() {
      const response = await this.$http({
        url: 'http://localhost:3939/requirements',
        data: { id: this.req.id, status: this.currentStatus },
        method: 'PUT',
      });
      let { status } = await response.data;
      this.req.status = status;
    },
  },
};
</script>

<style></style>
