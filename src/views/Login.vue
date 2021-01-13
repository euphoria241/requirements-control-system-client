<template>
  <v-container fluid>
    <v-layout flex align-center justify-center>
      <v-flex sm6 elevation-2 style="max-width:500px;">
        <v-card>
          <v-card-text class="pt-4">
            <div>
              <v-form @submit.prevent="submit" ref="form">
                <h1>Авторизация</h1>
                <v-alert v-if="wrongInputData" color="red" elevation="4" type="error" class="ma-2">
                  Неверный логин или пароль</v-alert
                >
                <v-text-field
                  v-model="username"
                  :rules="fieldRules"
                  type="text"
                  label="Логин"
                ></v-text-field>
                <v-text-field
                  v-model="password"
                  :rules="fieldRules"
                  :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="show ? 'text' : 'password'"
                  label="Пароль"
                  @click:append="show = !show"
                ></v-text-field>
                <v-btn type="submit">Войти</v-btn>
              </v-form>
            </div>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      fieldRules: [v => !!v || 'Обязательное поле'],
      show: false,
      wrongInputData: false,
    };
  },
  methods: {
    login() {
      let username = this.username;
      let password = this.password;
      this.$store
        .dispatch('login', { username, password })
        .then(() => {
          this.wrongInputData = false;
          this.$router.push('/');
        })
        .catch(err => {
          this.wrongInputData = true;
          console.log(err);
        });
    },
    submit() {
      if (this.$refs.form.validate()) {
        this.login();
      }
    },
  },
};
</script>

<style></style>
