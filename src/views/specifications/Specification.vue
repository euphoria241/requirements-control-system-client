<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        {{ specification.title }}
        <v-spacer></v-spacer>
        <v-btn icon elevation="2" @click="downloadDoc"
          ><v-icon dark>mdi-file-download</v-icon></v-btn
        >
      </v-card-title>

      <v-expansion-panels v-if="specification.sections" multiple>
        <v-expansion-panel v-for="section1 in specification.sections" :key="section1.id">
          <v-expansion-panel-header>
            <h3 class="font-weight-medium">{{ section1.position + '. ' + section1.title }}</h3>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <p>{{ section1.description }}</p>
            <h4 v-if="section1.requirements" class="font-weight-medium">Требования:</h4>
            <v-container fluid>
              <v-chip
                class="ma-1"
                v-for="req1 in section1.requirements"
                :key="req1.id"
                link
                @click="pushToRequirement(req1.id)"
                >{{ req1.name }}</v-chip
              >
            </v-container>
            <v-expansion-panels multiple>
              <v-expansion-panel v-for="section2 in section1.subsections" :key="section2.id">
                <v-expansion-panel-header>
                  <h4 class="font-weight-medium">
                    {{ section2.position + '. ' + section2.title }}
                  </h4>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <p>{{ section2.description }}</p>
                  <h4 v-if="section2.requirements" class="font-weight-medium">Требования:</h4>
                  <v-container fluid>
                    <v-chip
                      class="ma-1"
                      v-for="req2 in section2.requirements"
                      :key="req2.id"
                      link
                      @click="pushToRequirement(req2.id)"
                      >{{ req2.name }}</v-chip
                    >
                  </v-container>
                  <v-expansion-panels multiple>
                    <v-expansion-panel v-for="section3 in section2.subsections" :key="section3.id">
                      <v-expansion-panel-header>
                        <h4 class="font-weight-medium">
                          {{ section3.position + '. ' + section3.title }}
                        </h4>
                      </v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <p>{{ section3.description }}</p>
                        <h4 v-if="section3.requirements" class="font-weight-medium">Требования:</h4>
                        <v-container fluid>
                          <v-chip
                            class="ma-1"
                            v-for="req3 in section3.requirements"
                            :key="req3.id"
                            link
                            @click="pushToRequirement(req3.id)"
                            >{{ req3.name }}</v-chip
                          >
                        </v-container>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>
  </v-container>
</template>

<script>
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  UnderlineType,
  Footer,
  PageNumber,
  PageNumberFormat,
} from 'docx';
import { saveAs } from 'file-saver';
export default {
  data() {
    return {
      specification: {},
      firstname: 'Jhon',
      lastname: 'Doe',
      message: 'I just created a document using Vue.js 😲',
    };
  },
  async mounted() {
    try {
      const response = await this.$http({
        url: `http://localhost:3939/specifications?specificationID=${this.$route.params.specId}&hierarchical=true`,
        method: 'GET',
      });
      this.specification = response.data;
    } catch (error) {
      console.log(error);
    }
  },
  methods: {
    pushToRequirement(requirementID) {
      let routeData = this.$router.resolve({
        name: 'Требование',
        params: { reqID: requirementID },
      });
      window.open(routeData.href, '_blank');
    },
    async downloadDoc() {
      const response = await this.$http({
        url: `http://localhost:3939/specifications?specificationID=${this.$route.params.specId}`,
        method: 'GET',
      });

      const spec = await response.data;
      const doc = new Document({
        styles: {
          paragraphStyles: [
            {
              id: 'Heading1',
              name: 'Heading 1',
              basedOn: 'Normal',
              next: 'Normal',
              quickFormat: true,
              run: {
                size: 36,
                bold: true,
              },
              paragraph: {
                spacing: {
                  before: 240,
                  after: 120,
                },
              },
            },
            {
              id: 'Heading2',
              name: 'Heading 2',
              basedOn: 'Normal',
              next: 'Normal',
              quickFormat: true,
              run: {
                size: 30,
                bold: true,
              },
              paragraph: {
                spacing: {
                  before: 240,
                  after: 120,
                },
              },
            },
            {
              id: 'Heading3',
              name: 'Heading 3',
              basedOn: 'Normal',
              next: 'Normal',
              quickFormat: true,
              run: {
                size: 24,
                bold: true,
              },
              paragraph: {
                spacing: {
                  before: 240,
                  after: 120,
                },
              },
            },
          ],
        },
      });

      let sections = [];
      spec.sections.forEach(section => {
        if (section.position.split('.').length == 1) {
          sections.push(
            new Paragraph({
              text: `${section.position}. ${section.title}`,
              heading: HeadingLevel.HEADING_1,
            })
          );
        } else if (section.position.split('.').length == 2) {
          sections.push(
            new Paragraph({
              text: `${section.position}. ${section.title}`,
              heading: HeadingLevel.HEADING_2,
            })
          );
        } else if (section.position.split('.').length == 3) {
          sections.push(
            new Paragraph({
              text: `${section.position}. ${section.title}`,
              heading: HeadingLevel.HEADING_3,
            })
          );
        }
        sections.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            text: section.description ? section.description : '',
          })
        );

        if (section.requirements) {
          section.requirements.forEach(req => {
            sections.push(
              new Paragraph({
                text: `${req.name}`,
                heading: HeadingLevel.HEADING_3,
              })
            );
            sections.push(
              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                children: [
                  new TextRun({
                    text: 'Описание: ',
                    bold: true,
                  }),
                  new TextRun({
                    text: req.description,
                  }),
                ],
              })
            );
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Статус: ',
                    bold: true,
                  }),
                  new TextRun({
                    text: req.status,
                  }),
                ],
              })
            );
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Тип: ',
                    bold: true,
                  }),
                  new TextRun({
                    text: req.type,
                  }),
                ],
              })
            );
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Приоритет: ',
                    bold: true,
                  }),
                  new TextRun({
                    text: req.priority,
                  }),
                ],
              })
            );
          });
        }
      });
      doc.addSection({
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: ['Страница: ', PageNumber.CURRENT],
                  }),
                  new TextRun({
                    children: [' из ', PageNumber.TOTAL_PAGES],
                  }),
                ],
              }),
            ],
          }),
        },
        children: sections,
      });

      this.saveDocumentToFile(doc, `${spec.title}.docx`);
    },
    saveDocumentToFile: function(doc, fileName) {
      const mimeType = `application/vnd.openxmlformats
        officedocument.wordprocessingml.document`;
      Packer.toBlob(doc).then(blob => {
        const docblob = blob.slice(0, blob.size, mimeType);
        saveAs(docblob, fileName);
      });
    },
  },
};
</script>

<style></style>
