import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import {createPinia} from "pinia";
import {useThemeStore} from "./store/theme.ts";
import router from "./router";

const app = createApp(App)


app.use(createPinia())
app.use(router)
const themeStore = useThemeStore();
themeStore.initTheme();

app.mount('#app');

