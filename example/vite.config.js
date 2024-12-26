import { ghPages } from "vite-plugin-gh-pages";

/** @type {import('vite').UserConfig} */
export default {
  plugins: [ghPages()],
  define: {
    __TS__: JSON.stringify(new Date().toLocaleString()),
  },
};
