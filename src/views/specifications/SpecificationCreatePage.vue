<template>
  <v-container fluid>
    <v-alert v-if="!validated" color="red" elevation="4" type="error" class="ma-2">
      Не все поля заполнены</v-alert
    >
    <v-form ref="form" @submit.prevent="saveSpecification">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="specificationTitle"
            label="Название спецификации"
            clearable
            outlined
            :rules="fieldRules"
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            :rules="fieldRules"
            :items="templates"
            item-text="name"
            item-value="id"
            label="Выберите шаблон спецификации"
            outlined
            v-model="selectedTemplate"
            @change="getSelectedTemplate"
          ></v-autocomplete>
        </v-col>
      </v-row>

      <v-expansion-panels v-if="sectionsLoaded" multiple class="mb-5">
        <v-expansion-panel
          v-for="(firstLevelSection, index1) in templateSections.filter(
            sec => sec.position.split('.').length === 1
          )"
          :key="index1"
        >
          <v-expansion-panel-header>
            {{ firstLevelSection.position + '. ' + firstLevelSection.title }}
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-textarea
              :rules="fieldRules"
              filled
              label="Описание"
              auto-grow
              v-model="sectionsData[firstLevelSection.position]['description']"
            ></v-textarea>
            <v-autocomplete
              v-model="sectionsData[firstLevelSection.position]['requirements']"
              :items="requirements"
              item-text="name"
              item-value="id"
              label="Выбранные требования"
              multiple
              chips
              persistent-hint
            ></v-autocomplete>
            <v-expansion-panels multiple>
              <v-expansion-panel
                v-for="(secondLevelSection, index2) in templateSections.filter(
                  sec =>
                    sec.position.split('.')[0] === `${index1 + 1}` &&
                    sec.position.split('.').length == 2
                )"
                :key="index2"
              >
                <v-expansion-panel-header
                  >{{ secondLevelSection.position + '. ' + secondLevelSection.title }}
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-textarea
                    :rules="fieldRules"
                    filled
                    label="Описание"
                    auto-grow
                    v-model="sectionsData[secondLevelSection.position]['description']"
                  ></v-textarea>
                  <v-autocomplete
                    v-model="sectionsData[secondLevelSection.position]['requirements']"
                    :items="requirements"
                    item-text="name"
                    item-value="id"
                    label="Выбранные требования"
                    multiple
                    chips
                    persistent-hint
                  ></v-autocomplete>
                  <v-expansion-panels multiple>
                    <v-expansion-panel
                      v-for="(thirdLevelSection, index3) in templateSections.filter(
                        sec =>
                          sec.position.split('.')[0] === `${index1 + 1}` &&
                          sec.position.split('.')[1] === `${index2 + 1}` &&
                          sec.position.split('.').length == 3
                      )"
                      :key="index3"
                    >
                      <v-expansion-panel-header>
                        {{ thirdLevelSection.position + '. ' + thirdLevelSection.title }}
                      </v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <v-textarea
                          :rules="fieldRules"
                          filled
                          label="Описание"
                          auto-grow
                          v-model="sectionsData[thirdLevelSection.position]['description']"
                        ></v-textarea>
                        <v-autocomplete
                          v-model="sectionsData[thirdLevelSection.position]['requirements']"
                          :items="requirements"
                          item-text="name"
                          item-value="id"
                          label="Выбранные требования"
                          multiple
                          chips
                          persistent-hint
                        ></v-autocomplete>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-btn large color="primary" type="submit" class="mr-5" :disabled="!sectionsLoaded"
        >Создать спецификацию</v-btn
      >
      <v-btn large color="secondary" type="submit" @click="cancelCreation">Отменить</v-btn>
    </v-form>
  </v-container>
</template>

<script>
export default {
  name: 'SpecificationCreation',
  data() {
    return {
      templates: [],
      templateSections: [],
      selectedTemplate: null,
      sectionsLoaded: false,
      sectionsData: {},
      requirements: [],
      specificationTitle: '',
      fieldRules: [v => !!v || 'Обязательное поле'],
      validated: true,
    };
  },

  async mounted() {
    try {
      const response = await this.$http({
        url: 'http://localhost:3939/templates',
        method: 'GET',
      });

      this.templates = response.data;
      const reqs = await this.$http({
        url: `http://localhost:3939/requirements?project=${this.$route.params.projId}`,
        method: 'GET',
      });

      const reqsData = await reqs.data;
      this.requirements = reqsData;
    } catch (error) {
      console.log(error);
    }
  },
  computed: {
    disabledSelect() {
      return this.selectedTemplate ? true : false;
    },
  },
  methods: {
    async getSelectedTemplate() {
      try {
        let reqs = await this.$http({
          url: `http://localhost:3939/templates?templateID=${this.selectedTemplate}`,
          method: 'GET',
        });

        reqs = reqs.data.sort((a, b) => a.position - b.position);
        this.sectionsData = {};
        reqs.forEach(section => {
          this.sectionsData[section.position] = {};
        });
        this.templateSections = reqs;
        this.sectionsLoaded = true;
      } catch (error) {
        console.log(error);
      }
    },
    async saveSpecification() {
      this.validated = this.$refs.form.validate();
      if (this.validated) {
        console.log(123);
      }
      // let specificationObject = this.templateSections.map(section => {
      //   if (this.sectionsData[section.position].description) {
      //     section.description = this.sectionsData[section.position].description;
      //   }
      //   if (this.sectionsData[section.position].requirements) {
      //     section.requirements = this.sectionsData[section.position].requirements;
      //   }
      //   delete section.createdAt;
      //   delete section.updatedAt;
      //   delete section.templateID;
      //   delete section.id;
      //   return section;
      // });
      // let response = await this.$http({
      //   url: 'http://localhost:3939/specifications',
      //   data: {
      //     title: this.specificationTitle,
      //     sections: specificationObject,
      //     author: 1,
      //     project: parseInt(this.$route.params.projId),
      //   },
      //   method: 'POST',
      // });

      // this.$router.push({ name: 'Спецификации' });
    },
    cancelCreation() {
      this.$router.push({ name: 'Спецификации' });
    },
  },
};
</script>

<style></style>
