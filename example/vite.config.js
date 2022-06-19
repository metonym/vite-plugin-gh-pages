import { defineConfig } from "vite";
import { ghPages } from "vite-plugin-gh-pages";

export default defineConfig({
  base: "/vite-plugin-gh-pages/",
  plugins: [
    ghPages({
      onPublish: () => {
        console.log("🎉");
      },
    }),
  ],
});
