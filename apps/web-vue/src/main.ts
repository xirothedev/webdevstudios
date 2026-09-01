import { VueQueryPlugin } from '@tanstack/vue-query';
import { createHead } from '@unhead/vue/client';
import { createApp } from 'vue';

import App from '@/App.vue';
import '@/assets/globals.css';
import { queryClient } from '@/lib/query-client';
import { router } from '@/router';

const app = createApp(App);

app.use(createHead());
app.use(VueQueryPlugin, { queryClient });
app.use(router);
app.mount('#app');
