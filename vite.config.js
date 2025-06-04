import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue"; // 引入 plugin-vue
import vueJsx from "@vitejs/plugin-vue-jsx";

export default defineConfig({
  plugins: [
    vue(), // 添加 vue 插件以支持 .vue 文件解析
    vueJsx({}), // 保留 jsx 支持
  ],
  server: {
    port: 5174, // 端口更改为5174
  },
});
