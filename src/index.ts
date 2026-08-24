import type { PublishOptions, publish } from "gh-pages";
import gp from "gh-pages";
import type { Plugin } from "vite";
import { getPackageName } from "./get-package-name";

type CallbackPublishOptions = PublishOptions & { outDir: string };

type GhPagesOptions = PublishOptions & {
  /**
   * Runs before publish. `outDir` is Vite's build output directory.
   */
  onBeforePublish?: (publishOptions: CallbackPublishOptions) => void;
  /**
   * Runs after a successful publish.
   */
  onPublish?: (publishOptions: CallbackPublishOptions) => void;
  /**
   * Runs if `gh-pages` fails. Default logs the error.
   */
  onError?: Parameters<typeof publish>[2];
};

export const ghPages = (options?: GhPagesOptions): Plugin => {
  let outDir = "";

  const onError = options?.onError ?? ((error) => console.log(error));

  const onPublish =
    options?.onPublish ??
    (({ outDir, branch }) => {
      console.log(`🎉 Published \`${outDir}\` to branch \`${branch}\`.`);
    });

  return {
    name: "vite:gh-pages",

    // `vite build` only.
    apply: "build",

    // After other plugins so `outDir` is final.
    enforce: "post",

    config(config) {
      if (config.base === undefined) {
        config.base = "/" + getPackageName() + "/";
      }
    },

    configResolved(resolvedConfig) {
      outDir = resolvedConfig.build.outDir;
    },

    async closeBundle() {
      const gpOptions = {
        dotfiles: true,
        branch: "gh-pages",
        /**
         * Writes `.nojekyll` so GitHub Pages skips Jekyll.
         * @see https://github.blog/news-insights/bypassing-jekyll-on-github-pages/
         */
        nojekyll: true,
        ...options,
      };

      options?.onBeforePublish?.({ ...gpOptions, outDir });

      await gp.publish(outDir, gpOptions, (error) => {
        if (error) return onError(error);
        onPublish({ ...gpOptions, outDir });
      });
    },
  };
};
