import { createApp } from 'vue'
import App from './App.vue'
import * as echarts from 'echarts'
import axios from 'axios'

const app = createApp(App)

app.provide('axios',axios)
app.provide('echarts',echarts)

app.mount('#app')
