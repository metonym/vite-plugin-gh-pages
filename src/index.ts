import type { PublishOptions, publish } from "gh-pages";
import gp from "gh-pages";
import type { Plugin } from "vite";
import { getPackageName } from "./get-package-name";

type CallbackPublishOptions = PublishOptions & { outDir: string };

type GhPagesOptions = PublishOptions & {
  /**
   * Override the default pre-publish callback
   * fired before publishing to GitHub Pages.
   * @param publishOptions - The options passed to gh-pages
   */
  onBeforePublish?: (publishOptions: CallbackPublishOptions) => void;
  /**
   * Override the default success callback
   * fired after successful publishing.
   * @param publishOptions - The options passed to gh-pages
   */
  onPublish?: (publishOptions: CallbackPublishOptions) => void;
  /**
   * Override the default error callback
   * fired when gh-pages encounters an error.
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

    // Only executed on `vite build`.
    apply: "build",

    // Run after other plugins.
    enforce: "post",

    config(config) {
      if (config.base === undefined) {
        config.base = "/" + getPackageName() + "/";
      }
    },

    configResolved(resolvedConfig) {
      outDir = resolvedConfig.build.outDir;
    },

    // Wait for bundle to complete before publishing.
    async closeBundle() {
      // Default options can be overridden.
      const gpOptions = {
        // Include dotfiles by default.
        dotfiles: true,

        // Target branch (GitHub Pages default).
        branch: "gh-pages",

        /**
         * Disable Jekyll processing to bypass GitHub Pages' default behavior.
         * @see https://github.blog/news-insights/bypassing-jekyll-on-github-pages/
         */
        nojekyll: true,
        ...options,
      };

      // Call pre-publish hook if provided.
      // Useful for writing additional files to the `outDir`.
      options?.onBeforePublish?.({ ...gpOptions, outDir });

      // Publish to GitHub Pages.
      await gp.publish(outDir, gpOptions, (error) => {
        if (error) return onError(error);

        // Call success callback if provided.
        onPublish({ ...gpOptions, outDir });
      });
    },
  };
};
