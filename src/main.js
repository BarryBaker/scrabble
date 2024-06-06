import { createApp } from "vue";
import App from "./App.vue";
import VueNativeSock from "vue-native-websocket-vue3";
const app = createApp(App);

app.use(VueNativeSock, "ws://localhost:3000", {
  format: "json",
});

app.mount("#app");
