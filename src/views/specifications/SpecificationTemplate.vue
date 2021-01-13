<template>
  <div>
    <!-- <v-alert color="red" type="error" dismissible elevation="3" class="alert"> Jopa</v-alert> -->
    <v-form ref="form" v-model="valid" lazy-validation v-on:submit.prevent>
      <v-row>
        <v-col class="ml-4" cols="4">
          <v-text-field
            v-model="templateTitle"
            label="Имя шаблона"
            clearable
            required
            :rules="nameRules"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-expansion-panels>
        <v-expansion-panel
          v-for="(firstLevelSection, index1) in sections.filter(
            sec => sec.position.split('.').length === 1
          )"
          :key="index1"
        >
          <v-expansion-panel-header>
            {{ firstLevelSection.position + '. ' + firstLevelSection.title }}
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-expansion-panels>
              <v-expansion-panel
                v-for="(secondLevelSection, index2) in sections.filter(
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
                  <v-expansion-panels>
                    <v-expansion-panel
                      v-for="(thirdLevelSection, index3) in sections.filter(
                        sec =>
                          sec.position.split('.')[0] === `${index1 + 1}` &&
                          sec.position.split('.')[1] === `${index2 + 1}` &&
                          sec.position.split('.').length == 3
                      )"
                      :key="index3"
                      readonly
                    >
                      <v-expansion-panel-header>
                        {{ thirdLevelSection.position + '. ' + thirdLevelSection.title }}
                      </v-expansion-panel-header>
                      <v-expansion-panel-content> </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                  <v-form @submit.prevent="addThirdLevelSection(index1, index2)">
                    <v-row>
                      <v-col cols="12" sm="10">
                        <v-text-field
                          v-model="thirdLevelTitle"
                          label="Создавать новый раздел"
                          solo
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="2">
                        <v-btn block large color="primary" type="submit">Добавить</v-btn>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
            <v-form @submit.prevent="addSecondLevelSection(index1)">
              <v-row>
                <v-col cols="12" sm="10">
                  <v-text-field
                    v-model="secondLevelTitle"
                    label="Создавать новый раздел"
                    solo
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="2">
                  <v-btn block large color="primary" type="submit">Добавить</v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-form @submit.prevent="addFirstLevelSection">
        <v-row>
          <v-col cols="12" sm="10">
            <v-text-field
              v-model="firstLevelTitle"
              label="Создавать новый раздел"
              solo
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="2">
            <v-btn block large color="primary" type="submit">Добавить</v-btn>
          </v-col>
        </v-row>
      </v-form>
      <v-btn large color="primary" type="submit" class="mr-5" @click="saveTemplate"
        >Сохранить шаблон</v-btn
      >
      <v-btn large color="secondary" type="submit" @click="cancelCreation">Отменить</v-btn>
    </v-form>
  </div>
</template>

<script>
export default {
  name: 'TemplateCreator',
  data() {
    return {
      valid: true,
      templateTitle: '',
      firstLevelTitle: '',
      secondLevelTitle: '',
      thirdLevelTitle: '',
      sections: [],
      nameRules: [v => !!v || 'Name is required'],
    };
  },
  methods: {
    addFirstLevelSection() {
      const length = this.sections.filter(section => section.position.split('.').length == 1)
        .length;
      this.sections.push({ title: this.firstLevelTitle, position: `${length + 1}` });
      this.firstLevelTitle = '';
    },
    addSecondLevelSection(index) {
      const length = this.sections.filter(
        section =>
          section.position.startsWith(`${index + 1}.`) && section.position.split('.').length == 2
      ).length;
      this.sections.push({ title: this.secondLevelTitle, position: `${index + 1}.${length + 1}` });
      this.secondLevelTitle = '';
    },
    addThirdLevelSection(index1, index2) {
      const length = this.sections.filter(section =>
        section.position.startsWith(`${index1 + 1}.${index2 + 1}.`)
      ).length;
      this.sections.push({
        title: this.thirdLevelTitle,
        position: `${index1 + 1}.${index2 + 1}.${length + 1}`,
      });
      this.thirdLevelTitle = '';
    },
    async saveTemplate() {
      if (this.$refs.form.validate() && this.sections.length != 0) {
        const response = await this.$http({
          url: 'http://localhost:3939/templates',
          data: { title: this.templateTitle, sections: this.sections },
          method: 'POST',
        });
        let req = await response.data;
        this.$router.push({ name: 'Шаблоны спецификаций' });
      }
    },
    cancelCreation() {
      this.$router.push({ name: 'Шаблоны спецификаций' });
    },
  },
};
</script>

<style>
.alert {
  position: absolute;
  top: 15px;
  right: 15px;
}
</style>
