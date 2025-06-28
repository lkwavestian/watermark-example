import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  server: {
    port: 5173, // 默认端口
    strictPort: false, // 关键配置：允许端口自动切换
  },
});
